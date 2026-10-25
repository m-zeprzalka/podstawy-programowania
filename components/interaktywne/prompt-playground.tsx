"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CheckIcon,
  CircleNotchIcon,
  CopyIcon,
  PaperPlaneRightIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { odmiana } from "@/lib/format"
import { cn } from "@/lib/utils"

const MODEL = "claude-opus-5-5"
const API_URL = "https://api.anthropic.com/v1/messages"
const API_VERSION = "2026-10-21"
const MAX_TOKENS = 1024
/** Zaślepka klucza w kodzie. Tylko ASCII: inne znaki w nagłówku HTTP wywracają fetch. */
const KLUCZ_ZASLEPKA = "sk-ant-..."

const TOKENY: [string, string, string] = ["token", "tokeny", "tokenów"]

/* ---------- Generowanie kodu ---------- */

function cialoZadania(system: string | null, user: string) {
  return {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    ...(system !== null ? { system } : {}),
    messages: [{ role: "user", content: user }],
  }
}

const NAGLOWKI_HTTP = [
  `POST ${API_URL}`,
  `x-api-key: ${KLUCZ_ZASLEPKA}`,
  `anthropic-version: ${API_VERSION}`,
  "content-type: application/json",
].join("\n")

/** Literał napisu: składnia JSON jest tu zgodna i z Pythonem 3, i z JavaScriptem. */
const lit = (s: string) => JSON.stringify(s)

function programPython(system: string | null, user: string) {
  return [
    "# chat.py",
    "import anthropic",
    "",
    "client = anthropic.Anthropic()  # klucz API w zmiennej ANTHROPIC_API_KEY",
    "",
    ...(system !== null ? [`system = ${lit(system)}`] : []),
    '# Wersja interaktywna: prompt = input("Prompt: ")',
    `prompt = ${lit(user)}`,
    "",
    "message = client.messages.create(",
    `    model=${lit(MODEL)},`,
    `    max_tokens=${MAX_TOKENS},`,
    ...(system !== null ? ["    system=system,"] : []),
    "    messages=[",
    '        {"role": "user", "content": prompt},',
    "    ],",
    ")",
    "",
    "# Odpowiedź to lista bloków. Wypisujemy bloki z tekstem.",
    "for block in message.content:",
    '    if block.type == "text":',
    "        print(block.text)",
  ].join("\n")
}

function programJS(system: string | null, user: string) {
  return [
    "// chat.mjs: czysty JavaScript, bez instalowania bibliotek",
    `const API_KEY = ${lit(KLUCZ_ZASLEPKA)} // tu wklej swój klucz`,
    "",
    ...(system !== null ? [`const system = ${lit(system)}`] : []),
    `const prompt = ${lit(user)}`,
    "",
    `const response = await fetch(${lit(API_URL)}, {`,
    '  method: "POST",',
    "  headers: {",
    '    "x-api-key": API_KEY,',
    `    "anthropic-version": ${lit(API_VERSION)},`,
    '    "content-type": "application/json",',
    "    // Pozwala wysłać żądanie prosto z przeglądarki (CORS)",
    '    "anthropic-dangerous-direct-browser-access": "true",',
    "  },",
    "  body: JSON.stringify({",
    `    model: ${lit(MODEL)},`,
    `    max_tokens: ${MAX_TOKENS},`,
    ...(system !== null ? ["    system: system,"] : []),
    '    messages: [{ role: "user", content: prompt }],',
    "  }),",
    "})",
    "",
    "const data = await response.json()",
    "if (!response.ok) throw new Error(data.error.message)",
    "",
    "// Odpowiedź to lista bloków. Wypisujemy bloki z tekstem.",
    "for (const block of data.content) {",
    '  if (block.type === "text") console.log(block.text)',
    "}",
  ].join("\n")
}

/* ---------- Bardzo proste podświetlanie składni ---------- */

type Jezyk = "json" | "python" | "js" | "http"

type Rodzaj =
  | "klucz"
  | "napis"
  | "liczba"
  | "slowo"
  | "funkcja"
  | "komentarz"
  | "znak"
  | "tekst"

const KOLOR: Record<Rodzaj, string> = {
  klucz: "text-chart-3",
  napis: "text-signal-ink",
  liczba: "text-amber-ink",
  slowo: "text-amber-ink font-medium",
  funkcja: "text-chart-3",
  komentarz: "text-muted-foreground italic",
  znak: "text-muted-foreground",
  tekst: "",
}

/**
 * Każda grupa wyrażenia odpowiada kolejnemu rodzajowi z listy `grupy`.
 * Ostatnia grupa (reszta tekstu) nie ma rodzaju, więc zostaje zwykłym tekstem.
 */
const SKLADNIA: Record<Jezyk, { re: RegExp; grupy: Rodzaj[] }> = {
  json: {
    re: /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)|([{}[\],:])|([^"{}[\],:\d-]+|.)/g,
    grupy: ["klucz", "napis", "liczba", "znak"],
  },
  python: {
    re: /(#.*)|("(?:[^"\\]|\\.)*")|\b(from|import|def|return|if|else|for|in|while|None|True|False)\b|\b([A-Za-z_]\w*)(?=\(|=(?!=))|(\d+)|([()[\]{}.,:=])|([^#"()[\]{}.,:=\w]+|\w+|.)/g,
    grupy: ["komentarz", "napis", "slowo", "funkcja", "liczba", "znak"],
  },
  js: {
    re: /(\/\/.*)|("(?:[^"\\]|\\.)*")|\b(const|let|await|for|of|if|else|throw|new|return|true|false|null)\b|\b([A-Za-z_$][\w$]*)(?=\()|\b([A-Za-z_$][\w$]*)(?=\s*:)|(\d+)|([()[\]{}.,:=;!])|([^/"()[\]{}.,:=;!\w$]+|[\w$]+|.)/g,
    grupy: [
      "komentarz",
      "napis",
      "slowo",
      "funkcja",
      "klucz",
      "liczba",
      "znak",
    ],
  },
  http: {
    re: /^(POST|GET)\b|^([\w-]+)(?=:)|(:)|(\S.*)|(\s+)/g,
    grupy: ["slowo", "klucz", "znak", "napis"],
  },
}

type Token = { t: string; r: Rodzaj }

function tokenizuj(linia: string, jezyk: Jezyk): Token[] {
  const { re: wzor, grupy } = SKLADNIA[jezyk]
  const re = new RegExp(wzor)
  const out: Token[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(linia)) !== null) {
    const t = m[0]
    const i = m.findIndex((g, j) => j > 0 && g !== undefined)
    const r: Rodzaj = grupy[i - 1] ?? "tekst"
    const prev = out[out.length - 1]
    if (prev && prev.r === r) prev.t += t
    else out.push({ t, r })
  }
  return out
}

/* ---------- Blok kodu z kopiowaniem ---------- */

/** Zapasowe kopiowanie, gdy Clipboard API jest niedostępne (np. brak uprawnień). */
function kopiujAwaryjnie(tekst: string) {
  const ta = document.createElement("textarea")
  ta.value = tekst
  ta.setAttribute("readonly", "")
  ta.style.position = "fixed"
  ta.style.opacity = "0"
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  ta.remove()
  return ok
}

function KodBlok({
  nazwa,
  kod,
  jezyk,
}: {
  nazwa: string
  kod: string
  jezyk: Jezyk
}) {
  const [stan, setStan] = React.useState<"nic" | "ok" | "blad">("nic")

  React.useEffect(() => {
    if (stan === "nic") return
    const t = window.setTimeout(() => setStan("nic"), 1800)
    return () => window.clearTimeout(t)
  }, [stan])

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(kod)
      setStan("ok")
    } catch {
      setStan(kopiujAwaryjnie(kod) ? "ok" : "blad")
    }
  }

  const linie = kod.split("\n")

  return (
    <figure className="flex min-w-0 flex-col border bg-background">
      <figcaption className="flex h-10 items-center justify-between gap-2 border-b bg-muted/60 pr-1 pl-3">
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 bg-muted-foreground/50" aria-hidden />
          {nazwa}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={kopiuj}
          className={cn(
            "-mr-0.5",
            stan === "ok" && "text-signal-ink",
            stan === "blad" && "text-destructive"
          )}
        >
          {stan === "ok" ? (
            <CheckIcon data-icon="inline-start" />
          ) : stan === "blad" ? (
            <WarningIcon data-icon="inline-start" />
          ) : (
            <CopyIcon data-icon="inline-start" />
          )}
          {stan === "ok"
            ? "Skopiowano"
            : stan === "blad"
              ? "Brak dostępu"
              : "Kopiuj"}
        </Button>
        <span className="sr-only" aria-live="polite">
          {stan === "ok"
            ? "Skopiowano do schowka."
            : stan === "blad"
              ? "Nie udało się skopiować. Zaznacz kod ręcznie."
              : ""}
        </span>
      </figcaption>
      <pre className="py-3 font-mono text-[0.75rem] leading-5 sm:text-[0.8125rem] sm:leading-6">
        <code className="grid">
          {linie.map((linia, i) => {
            // Wcięcie zostaje prawdziwymi spacjami (ręcznie skopiowany Python
            // musi działać), a zawinięte wiersze wiszą 2 znaki głębiej.
            const wisi = linia.length - linia.trimStart().length + 2
            return (
              <span
                key={i}
                className="grid grid-cols-[2.5ch_minmax(0,1fr)] gap-x-3 pr-3 pl-2"
              >
                <span
                  className="text-right text-muted-foreground/60 select-none"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span
                  className="break-words whitespace-pre-wrap"
                  style={{
                    paddingLeft: `${wisi}ch`,
                    textIndent: `-${wisi}ch`,
                  }}
                >
                  {linia.trim() === ""
                    ? " "
                    : tokenizuj(linia, jezyk).map((tok, j) => (
                        <span key={j} className={KOLOR[tok.r]}>
                          {tok.t}
                        </span>
                      ))}
                </span>
              </span>
            )
          })}
        </code>
      </pre>
    </figure>
  )
}

/** Krótki opis pod blokiem kodu. */
function Notka({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-xs/relaxed text-muted-foreground">
      {children}
    </div>
  )
}

function Kod({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-foreground">{children}</code>
}

/* ---------- Wysyłanie na żywo ---------- */

type OdpowiedzApi = {
  content?: { type: string; text?: string }[]
  stop_reason?: string | null
  usage?: { input_tokens?: number; output_tokens?: number }
  error?: { type?: string; message?: string }
}

type Przebieg = {
  id: number
  system: string | null
  user: string
  tekst: string
  stopReason: string | null
  wejscie: number | null
  wyjscie: number | null
  ms: number
  surowa: string
}

type Wysylka =
  | { typ: "gotowe" }
  | { typ: "czeka"; od: number }
  | { typ: "blad"; komunikat: string; surowa?: string }

/** Podpis bloku `thinking` to setki znaków base64: w podglądzie wystarczy początek. */
function surowyJSON(dane: unknown) {
  return JSON.stringify(
    dane,
    (k, v) =>
      k === "signature" && typeof v === "string" && v.length > 32
        ? `${v.slice(0, 32)}…`
        : v,
    2
  )
}

function opisBledu(status: number, komunikat?: string) {
  const zApi = komunikat ? ` (${komunikat})` : ""
  if (status === 401)
    return `Nieprawidłowy klucz API. Sprawdź, czy jest wklejony w całości i zaczyna się od sk-ant-${zApi}.`
  if (status === 403) return `Ten klucz nie ma dostępu do API${zApi}.`
  if (status === 429)
    return `Za dużo zapytań albo wyczerpany limit konta. Odczekaj chwilę${zApi}.`
  if (status === 529 || status >= 500)
    return `Serwery Anthropic są chwilowo przeciążone. Spróbuj ponownie za kilka sekund${zApi}.`
  if (status === 400) return `API odrzuciło żądanie${zApi}.`
  return `Błąd HTTP ${status}${zApi}.`
}

const sekundy = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const formatSekundy = (ms: number) => `${sekundy.format(ms / 1000)} s`

function Stoper({ od }: { od: number }) {
  const [teraz, setTeraz] = React.useState(od)
  React.useEffect(() => {
    const t = window.setInterval(() => setTeraz(performance.now()), 100)
    return () => window.clearInterval(t)
  }, [])
  return <span className="tabular-nums">{formatSekundy(teraz - od)}</span>
}

/* ---------- Komponent ---------- */

/**
 * „Prompt Playground”: monit systemowy i monit użytkownika oraz to samo
 * żądanie do Claude'a w trzech postaciach: JSON (HTTP), Python (biblioteka
 * `anthropic`) i czysty JavaScript (`fetch`). Zakładka „Na żywo” wysyła
 * żądanie prosto z przeglądarki, jeśli wkleisz klucz API. Klucz zostaje
 * tylko w pamięci komponentu i trafia wyłącznie do api.anthropic.com.
 *
 * @example <PromptPlayground />
 * @example <PromptPlayground system="Odpowiadaj jak pirat." user="Co to jest bit?" />
 */
export function PromptPlayground({
  system = "Odpowiadaj jednym zdaniem. Udawaj, że jesteś kotem.",
  user = "W jednym zdaniu: czym jest programowanie?",
}: {
  /** Początkowa treść monitu systemowego. */
  system?: string
  /** Początkowa treść monitu użytkownika. */
  user?: string
}) {
  const [sys, setSys] = React.useState(system)
  const [usr, setUsr] = React.useState(user)
  const [sysWlaczony, setSysWlaczony] = React.useState(true)
  const [klucz, setKlucz] = React.useState("")
  const [wysylka, setWysylka] = React.useState<Wysylka>({ typ: "gotowe" })
  const [przebiegi, setPrzebiegi] = React.useState<Przebieg[]>([])
  const przerwij = React.useRef<AbortController | null>(null)
  const licznik = React.useRef(0)
  const sysId = React.useId()
  const usrId = React.useId()
  const kluczId = React.useId()

  React.useEffect(() => () => przerwij.current?.abort(), [])

  // Pusty monit systemowy nic nie wnosi, więc w żądaniu go pomijamy.
  const aktywnySystem = sysWlaczony && sys.trim() !== "" ? sys : null
  const json = JSON.stringify(cialoZadania(aktywnySystem, usr), null, 2)
  const python = programPython(aktywnySystem, usr)
  const js = programJS(aktywnySystem, usr)

  const czeka = wysylka.typ === "czeka"
  const moznaWyslac = !czeka && klucz.trim() !== "" && usr.trim() !== ""

  const wyslij = async () => {
    if (!moznaWyslac) return
    const k = klucz.trim()
    if (!/^[\x21-\x7e]+$/.test(k)) {
      setWysylka({
        typ: "blad",
        komunikat:
          "Klucz API zawiera niedozwolone znaki (spacje, polskie litery). Skopiuj go ponownie z Claude Console.",
      })
      return
    }
    const ctrl = new AbortController()
    przerwij.current = ctrl
    const start = performance.now()
    setWysylka({ typ: "czeka", od: start })
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": k,
          "anthropic-version": API_VERSION,
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(cialoZadania(aktywnySystem, usr)),
        signal: ctrl.signal,
      })
      const dane = (await res.json().catch(() => null)) as OdpowiedzApi | null
      const ms = performance.now() - start
      if (!res.ok || !dane || dane.error) {
        setWysylka({
          typ: "blad",
          komunikat: opisBledu(res.status, dane?.error?.message),
          surowa: dane ? surowyJSON(dane) : undefined,
        })
        return
      }
      licznik.current += 1
      const przebieg: Przebieg = {
        id: licznik.current,
        system: aktywnySystem,
        user: usr,
        tekst: (dane.content ?? [])
          .filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join(""),
        stopReason: dane.stop_reason ?? null,
        wejscie: dane.usage?.input_tokens ?? null,
        wyjscie: dane.usage?.output_tokens ?? null,
        ms,
        surowa: surowyJSON(dane),
      }
      setPrzebiegi((p) => [przebieg, ...p].slice(0, 4))
      setWysylka({ typ: "gotowe" })
    } catch {
      if (ctrl.signal.aborted) return
      setWysylka({
        typ: "blad",
        komunikat:
          "Nie udało się połączyć z api.anthropic.com. Sprawdź internet. Sieć uczelniana może blokować to połączenie: wtedy pomaga hotspot z telefonu.",
      })
    }
  }

  return (
    <Lab
      tytul="Prompt Playground"
      opis="Zmień monity i zobacz to samo żądanie do Claude'a jako JSON, w Pythonie i w JavaScripcie. Z kluczem API wyślesz je na żywo w zakładce „Na żywo”."
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setSys(system)
            setUsr(user)
            setSysWlaczony(true)
          }}
          aria-label="Przywróć przykładowe monity"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka="Bez klucza API nic nie jest wysyłane. Klucz trafia wyłącznie do api.anthropic.com."
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field className="gap-1.5">
            <div className="flex min-h-10 items-center justify-between gap-3">
              <FieldLabel htmlFor={sysId} className="text-sm font-medium">
                Monit systemowy
              </FieldLabel>
              <label className="flex min-h-10 cursor-pointer items-center gap-2 pl-2 font-mono text-xs text-muted-foreground">
                <span aria-hidden>
                  {sysWlaczony ? "włączony" : "wyłączony"}
                </span>
                <Switch
                  checked={sysWlaczony}
                  onCheckedChange={(v) => setSysWlaczony(v)}
                  aria-label="Używaj monitu systemowego"
                />
              </label>
            </div>
            <Textarea
              id={sysId}
              value={sys}
              onChange={(e) => setSys(e.target.value)}
              disabled={!sysWlaczony}
              rows={2}
              className="min-h-20 text-sm md:text-sm"
            />
            <FieldDescription>
              Zasady gry: jak model ma się zachowywać (rola, ton, długość).
            </FieldDescription>
          </Field>

          <Field className="gap-1.5">
            <div className="flex min-h-10 items-center">
              <FieldLabel htmlFor={usrId} className="text-sm font-medium">
                Monit użytkownika
              </FieldLabel>
            </div>
            <Textarea
              id={usrId}
              value={usr}
              onChange={(e) => setUsr(e.target.value)}
              rows={2}
              className="min-h-20 text-sm md:text-sm"
            />
            <FieldDescription>
              Konkretne pytanie lub polecenie – to, co wpisuje się w okno czatu.
            </FieldDescription>
          </Field>
        </div>

        <Tabs defaultValue="json" className="gap-3">
          <TabsList className="w-full group-data-horizontal/tabs:h-10">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="na-zywo">Na żywo</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="flex flex-col gap-2 text-sm">
            <KodBlok nazwa="nagłówki HTTP" kod={NAGLOWKI_HTTP} jezyk="http" />
            <KodBlok nazwa="request.json" kod={json} jezyk="json" />
            <Notka>
              <p>
                Tak wygląda żądanie, które naprawdę leci przez sieć: adres,
                nagłówki (klucz API, wersja API, format treści) i ciało w
                formacie JSON. Python i JavaScript budują dokładnie to samo.
              </p>
              <p>
                <Kod>max_tokens</Kod> to górny limit długości odpowiedzi w
                tokenach. Monit systemowy trafia do pola <Kod>system</Kod>, a
                pytanie do listy <Kod>messages</Kod> z rolą <Kod>user</Kod>.
              </p>
            </Notka>
          </TabsContent>

          <TabsContent value="python" className="flex flex-col gap-2 text-sm">
            <KodBlok nazwa="chat.py" kod={python} jezyk="python" />
            <Notka>
              <p>
                Około piętnastu linijek: biblioteka, klient, żądanie, wypisanie
                odpowiedzi. Odpowiedź to lista bloków: Claude może najpierw
                „pomyśleć” (blok <Kod>thinking</Kod>), a potem odpowiedzieć
                (blok <Kod>text</Kod>), dlatego wypisujemy tylko tekst.
              </p>
              <p className="font-medium text-foreground">
                Jak uruchomić (Python 3.10+):
              </p>
              <ol className="flex list-decimal flex-col gap-1 pl-5">
                <li>
                  Instalacja biblioteki: <Kod>pip install anthropic</Kod> (na
                  Windows także <Kod>py -m pip install anthropic</Kod>).
                </li>
                <li>
                  Klucz w zmiennej środowiskowej, w tym samym terminalu.
                  PowerShell:{" "}
                  <Kod>$env:ANTHROPIC_API_KEY = &quot;sk-ant-...&quot;</Kod>,
                  macOS i Linux:{" "}
                  <Kod>export ANTHROPIC_API_KEY=&quot;sk-ant-...&quot;</Kod>.
                </li>
                <li>
                  Uruchomienie: <Kod>python chat.py</Kod>.
                </li>
              </ol>
            </Notka>
          </TabsContent>

          <TabsContent value="js" className="flex flex-col gap-2 text-sm">
            <KodBlok nazwa="chat.mjs" kod={js} jezyk="js" />
            <Notka>
              <p>
                Bez żadnej biblioteki: wbudowana funkcja <Kod>fetch</Kod> wysyła
                to samo żądanie HTTP. Ten sam kod działa w Node.js i w
                przeglądarce, więc wystarczy dowolny komputer z internetem.
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                <li>
                  <span className="text-foreground">Node.js 18+:</span> zapisz
                  jako <Kod>chat.mjs</Kod>, wpisz klucz w <Kod>API_KEY</Kod>{" "}
                  (albo użyj <Kod>process.env.ANTHROPIC_API_KEY</Kod>) i uruchom{" "}
                  <Kod>node chat.mjs</Kod>.
                </li>
                <li>
                  <span className="text-foreground">Przeglądarka:</span>{" "}
                  naciśnij F12, otwórz zakładkę Konsola, wklej kod z kluczem i
                  naciśnij Enter. Za pierwszym razem przeglądarka może poprosić
                  o wpisanie zgody na wklejanie (np. <Kod>allow pasting</Kod>).
                  Przed kolejnym uruchomieniem odśwież stronę (F5).
                </li>
              </ul>
              <p>
                Nagłówek <Kod>anthropic-dangerous-direct-browser-access</Kod>{" "}
                pozwala wywołać API prosto ze strony. „Dangerous”, bo klucz jest
                wtedy widoczny w kodzie: dobre na zajęcia, ale nie do aplikacji
                udostępnianej innym.
              </p>
            </Notka>
          </TabsContent>

          <TabsContent value="na-zywo" className="flex flex-col gap-4 text-sm">
            <Field className="gap-1.5">
              <FieldLabel htmlFor={kluczId} className="text-sm font-medium">
                Klucz API Anthropic
              </FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={kluczId}
                  type="password"
                  value={klucz}
                  onChange={(e) => setKlucz(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") wyslij()
                  }}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 font-mono text-sm md:h-9 md:text-sm"
                />
                <Button
                  onClick={wyslij}
                  disabled={!moznaWyslac}
                  className="shrink-0"
                >
                  {czeka ? (
                    <CircleNotchIcon
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  ) : (
                    <PaperPlaneRightIcon data-icon="inline-start" />
                  )}
                  {czeka ? "Wysyłam…" : "Wyślij do Claude'a"}
                </Button>
              </div>
              <FieldDescription>
                Klucz zostaje tylko w pamięci tej karty i trafia wyłącznie do
                api.anthropic.com. Po odświeżeniu strony trzeba go wkleić
                ponownie.
              </FieldDescription>
            </Field>

            <Schemat system={aktywnySystem} user={usr}>
              <Wyjscie wysylka={wysylka} przebieg={przebiegi[0]} />
            </Schemat>

            {przebiegi.length > 1 ? (
              <section
                aria-labelledby={`${kluczId}-historia`}
                className="flex flex-col gap-2"
              >
                <LabLabel id={`${kluczId}-historia`}>
                  Wcześniejsze odpowiedzi
                </LabLabel>
                <ol className="flex flex-col gap-2">
                  {przebiegi.slice(1).map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-1.5 border bg-background p-3"
                    >
                      <p className="font-mono text-[0.6875rem] text-muted-foreground">
                        #{p.id} ·{" "}
                        {p.system !== null
                          ? "z monitem systemowym"
                          : "bez monitu systemowego"}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        <span className="font-mono text-chart-3">user: </span>
                        {p.user}
                      </p>
                      <p className="text-sm/relaxed whitespace-pre-wrap">
                        {p.tekst}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {przebiegi[0] || (wysylka.typ === "blad" && wysylka.surowa) ? (
              <Collapsible>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="group/surowa -mx-2 w-fit text-muted-foreground"
                    />
                  }
                >
                  <CaretDownIcon
                    data-icon="inline-start"
                    className="transition-transform duration-150 group-data-[panel-open]/surowa:rotate-180"
                  />
                  Surowa odpowiedź JSON
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-2 pt-2">
                  <KodBlok
                    nazwa="response.json"
                    kod={
                      wysylka.typ === "blad" && wysylka.surowa
                        ? wysylka.surowa
                        : (przebiegi[0]?.surowa ?? "")
                    }
                    jezyk="json"
                  />
                  <Notka>
                    {wysylka.typ === "blad" ? (
                      <p>
                        Tak API zgłasza błąd: rodzaj i komunikat są w polu{" "}
                        <Kod>error</Kod>.
                      </p>
                    ) : (
                      <p>
                        Tekst odpowiedzi jest w <Kod>content</Kod>, a w{" "}
                        <Kod>usage</Kod> widać, ile tokenów kosztowało pytanie i
                        odpowiedź. Długi podpis bloku <Kod>thinking</Kod> jest
                        tu skrócony.
                      </p>
                    )}
                  </Notka>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </Lab>
  )
}

/* ---------- Zakładka „Na żywo”: schemat i odpowiedź ---------- */

function Strzalka() {
  return (
    <div className="flex justify-center text-muted-foreground" aria-hidden>
      <ArrowDownIcon className="size-5 sm:hidden" />
      <ArrowRightIcon className="hidden size-5 sm:block" />
    </div>
  )
}

function Schemat({
  system,
  user,
  children,
}: {
  system: string | null
  user: string
  /** Zawartość pola „Wyjście”. */
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.9fr)_auto_minmax(0,1.4fr)] sm:items-center">
        <li className="flex flex-col gap-2 border bg-background p-3">
          <LabLabel>Wejście · monity</LabLabel>
          {system !== null ? (
            <p className="line-clamp-3 border-l-2 border-amber pl-2 text-xs/relaxed">
              <span className="font-mono text-amber-ink">system: </span>
              {system}
            </p>
          ) : null}
          <p className="line-clamp-3 border-l-2 border-chart-3 pl-2 text-xs/relaxed">
            <span className="font-mono text-chart-3">user: </span>
            {user || <em className="text-muted-foreground">(pusty)</em>}
          </p>
        </li>
        <Strzalka />
        <li className="flex flex-col gap-2 bg-primary p-3 text-primary-foreground">
          <p className="flex flex-wrap items-baseline justify-between gap-x-2 font-mono text-[0.6875rem] font-medium tracking-widest uppercase">
            <span className="opacity-75">Czarna skrzynka</span>
            <span className="tracking-normal normal-case">{MODEL}</span>
          </p>
          <ol className="flex flex-col gap-1 text-xs/relaxed">
            <li>1. tekst → tokeny → liczby</li>
            <li>2. obliczenia: który token będzie następny?</li>
            <li>3. tokeny → tekst odpowiedzi</li>
          </ol>
        </li>
        <Strzalka />
        <li
          className="flex flex-col gap-2 border border-dashed border-input p-3"
          aria-live="polite"
        >
          <LabLabel>Wyjście · odpowiedź</LabLabel>
          {children}
        </li>
      </ol>
      <p className="border-l-2 border-signal bg-signal-soft px-3 py-2 text-sm/relaxed">
        Model nie „czyta” liter. Dzieli tekst na tokeny, zamienia je na liczby i
        na podstawie wzorców przewiduje kolejne liczby, które na końcu wracają
        do postaci tekstu. AI też „tylko” operuje na liczbach.
      </p>
    </div>
  )
}

function Wyjscie({
  wysylka,
  przebieg,
}: {
  wysylka: Wysylka
  przebieg?: Przebieg
}) {
  if (wysylka.typ === "czeka") {
    return (
      <p className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
        <span
          className="inline-block h-[1em] w-[0.55em] animate-blink bg-signal"
          aria-hidden
        />
        Claude pisze odpowiedź… <Stoper od={wysylka.od} />
      </p>
    )
  }
  if (wysylka.typ === "blad") {
    return (
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>Nie udało się</AlertTitle>
        <AlertDescription>{wysylka.komunikat}</AlertDescription>
      </Alert>
    )
  }
  if (!przebieg) {
    return (
      <p className="text-xs/relaxed text-muted-foreground">
        Wklej klucz API i kliknij „Wyślij do Claude&apos;a”. Bez klucza skrzynka
        milczy.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm/relaxed whitespace-pre-wrap">
        {przebieg.tekst || (
          <em className="text-muted-foreground">(brak tekstu w odpowiedzi)</em>
        )}
      </p>
      {przebieg.stopReason === "max_tokens" ? (
        <p className="text-xs/relaxed text-amber-ink">
          Odpowiedź ucięta: skończył się limit max_tokens ({MAX_TOKENS}).
        </p>
      ) : null}
      {przebieg.stopReason === "refusal" ? (
        <p className="text-xs/relaxed text-amber-ink">
          Model odmówił odpowiedzi na to polecenie (stop_reason: refusal).
        </p>
      ) : null}
      <p className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
        {formatSekundy(przebieg.ms)}
        {przebieg.wejscie !== null
          ? ` · wejście: ${odmiana(przebieg.wejscie, TOKENY)}`
          : ""}
        {przebieg.wyjscie !== null
          ? ` · wyjście: ${odmiana(przebieg.wyjscie, TOKENY)}`
          : ""}
      </p>
    </div>
  )
}
