"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MODEL = "gpt-5"

/* ---------- Generowanie kodu ---------- */

function zadanieJSON(system: string | null, user: string) {
  const messages = [
    ...(system !== null ? [{ role: "system", content: system }] : []),
    { role: "user", content: user },
  ]
  return JSON.stringify({ model: MODEL, messages }, null, 2)
}

/** Literał napisu w Pythonie (składnia JSON jest tu zgodna z Pythonem 3). */
const py = (s: string) => JSON.stringify(s)

function programPython(system: string | null, user: string) {
  return [
    "# chat.py",
    "from openai import OpenAI",
    "",
    "client = OpenAI()  # klucz API w zmiennej OPENAI_API_KEY",
    "",
    ...(system !== null ? [`system = ${py(system)}`] : []),
    '# Wersja interaktywna: prompt = input("Prompt: ")',
    `prompt = ${py(user)}`,
    "",
    "response = client.chat.completions.create(",
    `    model=${py(MODEL)},`,
    "    messages=[",
    ...(system !== null
      ? ['        {"role": "system", "content": system},']
      : []),
    '        {"role": "user", "content": prompt},',
    "    ],",
    ")",
    "",
    "print(response.choices[0].message.content)",
  ].join("\n")
}

/* ---------- Bardzo proste podświetlanie składni ---------- */

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

type Token = { t: string; r: Rodzaj }

const RE_JSON =
  /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)|([{}[\],:])|([^"{}[\],:\d-]+|.)/g

const RE_PY =
  /(#.*)|("(?:[^"\\]|\\.)*")|\b(from|import|def|return|if|else|for|in|while|None|True|False)\b|\b([A-Za-z_]\w*)(?=\(|=(?!=))|(\d+)|([()[\]{}.,:=])|([^#"()[\]{}.,:=\w]+|\w+|.)/g

function tokenizuj(linia: string, jezyk: "json" | "python"): Token[] {
  const out: Token[] = []
  const re = new RegExp(jezyk === "json" ? RE_JSON : RE_PY)
  let m: RegExpExecArray | null
  while ((m = re.exec(linia)) !== null) {
    const [t, a, b, c, d, e, f] = m
    let r: Rodzaj = "tekst"
    if (jezyk === "json") {
      if (a) r = "klucz"
      else if (b) r = "napis"
      else if (c) r = "liczba"
      else if (d) r = "znak"
    } else {
      if (a) r = "komentarz"
      else if (b) r = "napis"
      else if (c) r = "slowo"
      else if (d) r = "funkcja"
      else if (e) r = "liczba"
      else if (f) r = "znak"
    }
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
  jezyk: "json" | "python"
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
            const wciecie = linia.length - linia.trimStart().length
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
                    paddingLeft: `${wciecie + 2}ch`,
                    textIndent: "-2ch",
                  }}
                >
                  {linia.trim() === ""
                    ? "​"
                    : tokenizuj(linia.trimStart(), jezyk).map((tok, j) => (
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

/* ---------- Komponent ---------- */

/**
 * „Prompt Playground”: monit systemowy i monit użytkownika oraz podgląd,
 * jak wyglądałoby żądanie do modelu (JSON w stylu Chat Completions)
 * i program `chat.py`. Nic nie jest wysyłane.
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
  const sysId = React.useId()
  const usrId = React.useId()

  const aktywnySystem = sysWlaczony ? sys : null
  const json = zadanieJSON(aktywnySystem, usr)
  const python = programPython(aktywnySystem, usr)

  return (
    <Lab
      tytul="Prompt Playground"
      opis="Zmień monity i zobacz, co program wysłałby do modelu językowego. Wyłącz monit systemowy, żeby porównać oba żądania."
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
      stopka="To tylko podgląd żądania – nic nie jest wysyłane."
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
            <TabsTrigger value="json">Żądanie JSON</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="schemat">Co jest czym?</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="flex flex-col gap-2 text-sm">
            <KodBlok nazwa="request.json" kod={json} jezyk="json" />
            <p className="text-xs/relaxed text-muted-foreground">
              Ciało żądania w stylu Chat Completions: nazwa modelu i lista
              wiadomości z rolami{" "}
              <code className="font-mono text-foreground">system</code> i{" "}
              <code className="font-mono text-foreground">user</code>.
            </p>
          </TabsContent>

          <TabsContent value="python" className="flex flex-col gap-2 text-sm">
            <KodBlok nazwa="chat.py" kod={python} jezyk="python" />
            <p className="text-xs/relaxed text-muted-foreground">
              Około dziesięciu linijek: biblioteka, klient, żądanie, wypisanie
              odpowiedzi. Do uruchomienia potrzeba konta i klucza API, więc
              na razie traktuj ten przykład poglądowo.
            </p>
          </TabsContent>

          <TabsContent value="schemat" className="text-sm">
            <Schemat system={aktywnySystem} user={usr} />
          </TabsContent>
        </Tabs>
      </div>
    </Lab>
  )
}

/* ---------- Zakładka „Co jest czym?” ---------- */

function Strzalka() {
  return (
    <div className="flex justify-center text-muted-foreground" aria-hidden>
      <ArrowDownIcon className="size-5 sm:hidden" />
      <ArrowRightIcon className="hidden size-5 sm:block" />
    </div>
  )
}

function Schemat({ system, user }: { system: string | null; user: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)_auto_minmax(0,1fr)] sm:items-center">
        <li className="flex flex-col gap-2 border bg-background p-3">
          <LabLabel>Wejście · monity</LabLabel>
          {system !== null ? (
            <p className="line-clamp-3 border-l-2 border-amber pl-2 text-xs/relaxed">
              <span className="font-mono text-amber-ink">system: </span>
              {system || <em className="text-muted-foreground">(pusty)</em>}
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
            <span className="tracking-normal normal-case">model {MODEL}</span>
          </p>
          <ol className="flex flex-col gap-1 text-xs/relaxed">
            <li>1. tekst → tokeny → liczby</li>
            <li>2. obliczenia: który token będzie następny?</li>
            <li>3. tokeny → tekst odpowiedzi</li>
          </ol>
        </li>
        <Strzalka />
        <li className="flex flex-col gap-2 border border-dashed border-input p-3">
          <LabLabel>Wyjście · odpowiedź</LabLabel>
          <p className="text-xs/relaxed text-muted-foreground">
            Tu pojawiłby się tekst od modelu. W tym podglądzie nic nie wysyłamy,
            więc skrzynka milczy.
          </p>
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
