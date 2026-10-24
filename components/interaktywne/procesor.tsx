"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  FootprintsIcon,
  PauseIcon,
  PlayIcon,
  SkipForwardIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { groupBits, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

/* ---------- Zestaw instrukcji ---------- */

type Rejestr = "A" | "B"
type Instrukcja =
  | { op: "LOAD"; r: Rejestr; n: number }
  | { op: "ADD"; r: Rejestr; r2: Rejestr }
  | { op: "SUB"; r: Rejestr; n: number }
  | { op: "PRINT"; r: Rejestr }
  | { op: "JUMP"; adr: number }
  | { op: "JUMPZ"; r: Rejestr; adr: number }
  | { op: "HALT" }

type Linia = { ins: Instrukcja; komentarz: string }

const KOD_OP: Record<Instrukcja["op"], number> = {
  HALT: 0,
  LOAD: 1,
  ADD: 2,
  SUB: 3,
  PRINT: 4,
  JUMP: 5,
  JUMPZ: 6,
}
const NR_REJ: Record<Rejestr, number> = { A: 0, B: 1 }

/** Kod maszynowy: 1. bajt = operacja (górna cyfra hex) i rejestr, 2. bajt = liczba/adres. */
function kodMaszynowy(i: Instrukcja) {
  const r = "r" in i ? NR_REJ[i.r] : 0
  const arg =
    i.op === "LOAD" || i.op === "SUB"
      ? i.n
      : i.op === "ADD"
        ? NR_REJ[i.r2]
        : i.op === "JUMP" || i.op === "JUMPZ"
          ? i.adr
          : 0
  return `${toHex((KOD_OP[i.op] << 4) | r)} ${toHex(arg)}`
}

function asembler(i: Instrukcja) {
  switch (i.op) {
    case "LOAD":
    case "SUB":
      return `${i.op} ${i.r}, ${i.n}`
    case "ADD":
      return `ADD ${i.r}, ${i.r2}`
    case "PRINT":
      return `PRINT ${i.r}`
    case "JUMP":
      return `JUMP ${i.adr}`
    case "JUMPZ":
      return `JUMPZ ${i.r}, ${i.adr}`
    case "HALT":
      return "HALT"
  }
}

function znaczenie(i: Instrukcja) {
  switch (i.op) {
    case "LOAD":
      return `wpisz ${i.n} do rejestru ${i.r}`
    case "ADD":
      return `dodaj ${i.r2} do ${i.r}`
    case "SUB":
      return `odejmij ${i.n} od ${i.r}`
    case "PRINT":
      return `wypisz zawartość ${i.r}`
    case "JUMP":
      return `skocz do adresu ${i.adr}`
    case "JUMPZ":
      return `jeśli ${i.r} = 0, skocz do adresu ${i.adr}`
    case "HALT":
      return "zatrzymaj procesor"
  }
}

const LEGENDA: { skladnia: string; kod: string; dzialanie: string }[] = [
  {
    skladnia: "LOAD R, n",
    kod: "1R nn",
    dzialanie: "R = n (wpisz liczbę do rejestru)",
  },
  { skladnia: "ADD R, R2", kod: "2R 0R2", dzialanie: "R = R + R2" },
  { skladnia: "SUB R, n", kod: "3R nn", dzialanie: "R = R − n" },
  { skladnia: "PRINT R", kod: "4R 00", dzialanie: "wypisz R na konsolę" },
  { skladnia: "JUMP adr", kod: "50 aa", dzialanie: "skocz: PC = adr" },
  {
    skladnia: "JUMPZ R, adr",
    kod: "6R aa",
    dzialanie: "jeśli R = 0, to PC = adr",
  },
  { skladnia: "HALT", kod: "00 00", dzialanie: "zatrzymaj procesor" },
]

/* ---------- Programy ---------- */

type ProgramId = "dodawanie" | "odliczanie" | "nieskonczona"

const PROGRAMY: Record<
  ProgramId,
  { nazwa: string; linie: Linia[]; ostrzezenie?: boolean }
> = {
  dodawanie: {
    nazwa: "2 + 3",
    linie: [
      { ins: { op: "LOAD", r: "A", n: 2 }, komentarz: "A = 2" },
      { ins: { op: "LOAD", r: "B", n: 3 }, komentarz: "B = 3" },
      { ins: { op: "ADD", r: "A", r2: "B" }, komentarz: "A = A + B" },
      { ins: { op: "PRINT", r: "A" }, komentarz: "wypisz A" },
      { ins: { op: "HALT" }, komentarz: "koniec" },
    ],
  },
  odliczanie: {
    nazwa: "Odliczanie 3, 2, 1",
    linie: [
      { ins: { op: "LOAD", r: "A", n: 3 }, komentarz: "licznik = 3" },
      { ins: { op: "PRINT", r: "A" }, komentarz: "wypisz licznik" },
      { ins: { op: "SUB", r: "A", n: 1 }, komentarz: "licznik − 1" },
      { ins: { op: "JUMPZ", r: "A", adr: 5 }, komentarz: "zero? → koniec" },
      { ins: { op: "JUMP", adr: 1 }, komentarz: "wróć do adresu 1" },
      { ins: { op: "HALT" }, komentarz: "koniec" },
    ],
  },
  nieskonczona: {
    nazwa: "Pętla nieskończona",
    ostrzezenie: true,
    linie: [
      { ins: { op: "LOAD", r: "A", n: 0 }, komentarz: "A = 0" },
      { ins: { op: "LOAD", r: "B", n: 1 }, komentarz: "B = 1" },
      { ins: { op: "ADD", r: "A", r2: "B" }, komentarz: "A = A + 1" },
      { ins: { op: "PRINT", r: "A" }, komentarz: "wypisz A" },
      { ins: { op: "JUMP", adr: 2 }, komentarz: "wróć do 2, zawsze" },
    ],
  },
}

const LISTA_PROGRAMOW = (Object.keys(PROGRAMY) as ProgramId[]).map((id) => ({
  value: id,
  label: PROGRAMY[id].nazwa,
}))

/** Bezpiecznik: maksymalna liczba wykonanych instrukcji. */
const LIMIT = 60

/* ---------- Maszyna stanów ---------- */

type Faza = "pobierz" | "dekoduj" | "wykonaj"

const FAZY: { id: Faza; nazwa: string; en: string; opis: string }[] = [
  {
    id: "pobierz",
    nazwa: "Pobierz",
    en: "fetch",
    opis: "Procesor czyta z pamięci instrukcję spod adresu w PC i zwiększa PC o 1.",
  },
  {
    id: "dekoduj",
    nazwa: "Dekoduj",
    en: "decode",
    opis: "Procesor rozpoznaje kod instrukcji: co ma zrobić i na jakich danych.",
  },
  {
    id: "wykonaj",
    nazwa: "Wykonaj",
    en: "execute",
    opis: "Procesor wykonuje działanie: liczy, wypisuje albo zmienia PC, czyli skacze.",
  },
]

type Stop = null | "halt" | "limit" | "koniec"

type Stan = {
  program: ProgramId
  pc: number
  /** Adres instrukcji w rejestrze instrukcji (IR). */
  ir: number | null
  zdekodowano: boolean
  nastepna: Faza
  ostatnia: Faza | null
  A: number
  B: number
  wyjscie: { id: number; tekst: string }[]
  wypisano: number
  zmiana: "A" | "B" | "PC" | "IR" | null
  wykonane: number
  stop: Stop
  komunikat: string
  dziala: boolean
}

type Akcja =
  | { typ: "faza" }
  | { typ: "instrukcja" }
  | { typ: "start" }
  | { typ: "pauza" }
  | { typ: "reset"; program?: ProgramId }

function stanPoczatkowy(program: ProgramId): Stan {
  return {
    program,
    pc: 0,
    ir: null,
    zdekodowano: false,
    nastepna: "pobierz",
    ostatnia: null,
    A: 0,
    B: 0,
    wyjscie: [],
    wypisano: 0,
    zmiana: null,
    wykonane: 0,
    stop: null,
    komunikat:
      "Procesor czeka. PC = 0, więc pierwsza zostanie pobrana instrukcja spod adresu 0.",
    dziala: false,
  }
}

const bajt = (n: number) => ((n % 256) + 256) % 256

function krok(s: Stan): Stan {
  if (s.stop) return { ...s, dziala: false }
  const linie = PROGRAMY[s.program].linie

  if (s.nastepna === "pobierz") {
    if (s.pc >= linie.length) {
      return {
        ...s,
        stop: "koniec",
        dziala: false,
        komunikat: `Pod adresem ${s.pc} nie ma już instrukcji, więc procesor się zatrzymuje.`,
      }
    }
    const ins = linie[s.pc].ins
    return {
      ...s,
      ir: s.pc,
      pc: s.pc + 1,
      zdekodowano: false,
      ostatnia: "pobierz",
      nastepna: "dekoduj",
      zmiana: "IR",
      komunikat: `Pobrano kod ${kodMaszynowy(ins)} spod adresu ${s.pc}. PC = ${s.pc + 1}.`,
    }
  }

  const ins = linie[s.ir ?? 0].ins

  if (s.nastepna === "dekoduj") {
    return {
      ...s,
      zdekodowano: true,
      ostatnia: "dekoduj",
      nastepna: "wykonaj",
      zmiana: null,
      komunikat: `${kodMaszynowy(ins)} to ${asembler(ins)}: ${znaczenie(ins)}.`,
    }
  }

  // Wykonaj
  const n: Stan = {
    ...s,
    ostatnia: "wykonaj",
    nastepna: "pobierz",
    wykonane: s.wykonane + 1,
    zmiana: null,
  }
  switch (ins.op) {
    case "LOAD":
      n[ins.r] = bajt(ins.n)
      n.zmiana = ins.r
      n.komunikat = `${ins.r} = ${n[ins.r]}.`
      break
    case "ADD": {
      const suma = s[ins.r] + s[ins.r2]
      n[ins.r] = bajt(suma)
      n.zmiana = ins.r
      n.komunikat = `${ins.r} = ${s[ins.r]} + ${s[ins.r2]} = ${n[ins.r]}.${suma > 255 ? " Przepełnienie: 8 bitów mieści tylko 0–255." : ""}`
      break
    }
    case "SUB": {
      const roznica = s[ins.r] - ins.n
      n[ins.r] = bajt(roznica)
      n.zmiana = ins.r
      n.komunikat = `${ins.r} = ${s[ins.r]} − ${ins.n} = ${n[ins.r]}.${roznica < 0 ? " Przepełnienie: poniżej 0 licznik przeskakuje na 255." : ""}`
      break
    }
    case "PRINT":
      n.wyjscie = [
        ...s.wyjscie,
        { id: s.wypisano, tekst: String(s[ins.r]) },
      ].slice(-100)
      n.wypisano = s.wypisano + 1
      n.komunikat = `Na konsolę trafia zawartość ${ins.r}: ${s[ins.r]}.`
      break
    case "JUMP":
      n.pc = ins.adr
      n.zmiana = "PC"
      n.komunikat = `Skok: PC = ${ins.adr}, więc następna będzie instrukcja spod adresu ${ins.adr}.`
      break
    case "JUMPZ":
      if (s[ins.r] === 0) {
        n.pc = ins.adr
        n.zmiana = "PC"
        n.komunikat = `${ins.r} = 0, więc jest skok: PC = ${ins.adr}.`
      } else {
        n.komunikat = `${ins.r} = ${s[ins.r]}, czyli nie zero: bez skoku, PC zostaje ${s.pc}.`
      }
      break
    case "HALT":
      n.stop = "halt"
      n.dziala = false
      n.komunikat = "HALT: procesor się zatrzymuje. Koniec programu."
      break
  }
  if (!n.stop && n.wykonane >= LIMIT) {
    n.stop = "limit"
    n.dziala = false
    n.komunikat = `Bezpiecznik: zatrzymano po ${LIMIT} instrukcjach. Ten program sam by się nie skończył.`
  }
  return n
}

function reduktor(s: Stan, a: Akcja): Stan {
  switch (a.typ) {
    case "faza":
      return krok(s)
    case "instrukcja": {
      let n = krok(s)
      while (!n.stop && n.nastepna !== "pobierz") n = krok(n)
      return n
    }
    case "start":
      return s.stop ? s : { ...s, dziala: true }
    case "pauza":
      return { ...s, dziala: false }
    case "reset":
      return stanPoczatkowy(a.program ?? s.program)
  }
}

/* ---------- Komponent ---------- */

/**
 * Zabawkowy procesor z dwoma rejestrami (A, B) i licznikiem rozkazów (PC).
 * Pokazuje cykl pobierz → zdekoduj → wykonaj krok po kroku, a pętlę jako skok.
 *
 * @example <Procesor program="odliczanie" />
 */
export function Procesor({
  program = "dodawanie",
  tytul = "Zabawkowy procesor",
}: {
  /** Program na start: "dodawanie" (2 + 3), "odliczanie" (3, 2, 1) albo "nieskonczona". */
  program?: ProgramId
  tytul?: string
}) {
  const [s, dispatch] = React.useReducer(
    reduktor,
    PROGRAMY[program] ? program : "dodawanie",
    stanPoczatkowy
  )
  const selectId = React.useId()
  const konsolaRef = React.useRef<HTMLDivElement>(null)

  const prog = PROGRAMY[s.program]

  // Tryb „Uruchom”: jedna faza co ~170 ms, czyli pełna instrukcja co ~500 ms.
  React.useEffect(() => {
    if (!s.dziala) return
    const spokojnie = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const id = window.setInterval(
      () => dispatch({ typ: spokojnie ? "instrukcja" : "faza" }),
      spokojnie ? 500 : 170
    )
    return () => window.clearInterval(id)
  }, [s.dziala])

  // Przewiń konsolę do ostatniej linii.
  React.useEffect(() => {
    const el = konsolaRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [s.wypisano, s.stop])

  const zatrzymany = s.stop !== null
  const irIns = s.ir !== null ? prog.linie[s.ir].ins : null
  const fazaOpis = FAZY.find((f) => f.id === (s.ostatnia ?? "pobierz"))!

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Procesor w kółko powtarza ten sam cykl: <strong>pobiera</strong>{" "}
          instrukcję spod adresu z licznika rozkazów (PC),{" "}
          <strong>dekoduje</strong> ją i <strong>wykonuje</strong>. Pętla to po
          prostu skok do wcześniejszego adresu, czyli „wróć do linii 3” z
          pseudokodu.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ typ: "reset" })}
          aria-label="Reset procesora"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka="Prawdziwy procesor wykonuje miliardy takich cykli na sekundę."
    >
      <div className="flex flex-col gap-5">
        {/* Wybór programu */}
        <div className="flex flex-col gap-3">
          <Field className="sm:max-w-72">
            <FieldLabel htmlFor={selectId} className="text-sm font-medium">
              Program
            </FieldLabel>
            <Select
              items={LISTA_PROGRAMOW}
              value={s.program}
              onValueChange={(v) => {
                if (v) dispatch({ typ: "reset", program: v as ProgramId })
              }}
            >
              <SelectTrigger
                id={selectId}
                className="h-10 w-full text-sm data-[size=default]:h-10 md:data-[size=default]:h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTA_PROGRAMOW.map((p) => (
                  <SelectItem
                    key={p.value}
                    value={p.value}
                    className="py-2.5 text-sm"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {prog.ostrzezenie ? (
            <p className="flex items-start gap-2 border border-amber/60 bg-amber-soft px-3 py-2 text-sm text-foreground">
              <WarningIcon
                weight="fill"
                className="mt-0.5 size-4 shrink-0 text-amber-ink"
                aria-hidden
              />
              <span>
                Ten program nigdy nie dochodzi do{" "}
                <code className="font-mono">HALT</code>, jak klocek „zawsze” w
                Scratchu. Bezpiecznik zatrzyma go po {LIMIT} instrukcjach.
              </span>
            </p>
          ) : null}
        </div>

        {/* Sterowanie */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            variant="outline"
            onClick={() => dispatch({ typ: "faza" })}
            disabled={zatrzymany || s.dziala}
            aria-label={`Krok: jedna faza (następna: ${FAZY.find((f) => f.id === s.nastepna)!.nazwa})`}
          >
            <FootprintsIcon data-icon="inline-start" />
            Krok
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch({ typ: "instrukcja" })}
            disabled={zatrzymany || s.dziala}
            aria-label="Instrukcja: dokończ pełny cykl"
          >
            <SkipForwardIcon data-icon="inline-start" />
            Instrukcja
          </Button>
          <Button
            onClick={() => dispatch({ typ: s.dziala ? "pauza" : "start" })}
            disabled={zatrzymany}
            aria-pressed={s.dziala}
          >
            {s.dziala ? (
              <PauseIcon data-icon="inline-start" weight="fill" />
            ) : (
              <PlayIcon data-icon="inline-start" weight="fill" />
            )}
            {s.dziala ? "Pauza" : "Uruchom"}
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ typ: "reset" })}>
            <ArrowCounterClockwiseIcon data-icon="inline-start" />
            Reset
          </Button>
        </div>

        {/* Fazy cyklu */}
        <div className="flex flex-col gap-2">
          <LabLabel>Cykl procesora</LabLabel>
          <ol
            className="grid grid-cols-3 gap-px border bg-border"
            aria-label="Fazy cyklu"
          >
            {FAZY.map((f, i) => {
              const biezaca = s.ostatnia === f.id
              const dalej = !zatrzymany && s.nastepna === f.id
              return (
                <li
                  key={f.id}
                  aria-current={biezaca ? "step" : undefined}
                  className={cn(
                    "flex min-w-0 flex-col gap-0.5 px-2 py-2 transition-colors duration-150 sm:px-3",
                    biezaca
                      ? "bg-signal text-signal-foreground"
                      : "bg-card text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] tabular-nums opacity-80">
                    {i + 1}
                    <span className="truncate">{f.en}</span>
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      !biezaca && "text-foreground"
                    )}
                  >
                    {f.nazwa}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[0.625rem] tracking-wide uppercase",
                      dalej ? "text-signal-ink" : "invisible"
                    )}
                    aria-hidden={!dalej}
                  >
                    następna
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="flex flex-col gap-1 text-sm/relaxed">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {fazaOpis.nazwa}:
              </span>{" "}
              {fazaOpis.opis}
            </p>
            <p
              aria-live="polite"
              className={cn(
                "border-l-2 pl-3 font-mono text-[0.8125rem]",
                s.stop === "limit"
                  ? "border-amber text-amber-ink"
                  : "border-signal"
              )}
            >
              {s.komunikat}
            </p>
          </div>
        </div>

        {/* Pamięć programu + rejestry */}
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            <LabLabel>Pamięć programu</LabLabel>
            <ol className="border" aria-label="Pamięć programu">
              {prog.linie.map((l, i) => {
                const wIr = s.ir === i
                const naPc = s.pc === i && !zatrzymany
                return (
                  <li
                    key={i}
                    aria-current={wIr ? "step" : undefined}
                    className={cn(
                      "grid min-h-11 grid-cols-[2.25rem_1.25rem_minmax(0,1fr)_auto] items-center gap-x-2 border-b border-l-2 border-l-transparent py-1.5 pr-2.5 pl-1.5 last:border-b-0",
                      wIr && "border-l-signal bg-signal-soft"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[0.6875rem] font-semibold whitespace-nowrap text-amber-ink",
                        !naPc && "invisible"
                      )}
                      aria-label={naPc ? "Tu wskazuje PC" : undefined}
                      aria-hidden={!naPc}
                    >
                      PC▸
                    </span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {i}
                    </span>
                    <span className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <code className="font-mono text-[0.8125rem] font-semibold whitespace-nowrap">
                        {asembler(l.ins)}
                      </code>
                      <span className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                        ; {l.komentarz}
                      </span>
                    </span>
                    <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                      {kodMaszynowy(l.ins)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <LabLabel>Rejestry</LabLabel>
            <LabReadouts className="sm:grid-cols-2">
              <LabReadout
                label="PC"
                value={s.pc}
                hint="następny adres"
                accent={s.zmiana === "PC"}
              />
              <LabReadout
                label="IR"
                value={
                  <span className="text-base md:text-lg">
                    {irIns ? kodMaszynowy(irIns) : "—"}
                  </span>
                }
                hint={
                  irIns
                    ? s.zdekodowano
                      ? asembler(irIns)
                      : "nie zdekodowano"
                    : "pusty"
                }
                accent={s.zmiana === "IR"}
              />
              <LabReadout
                label="A"
                value={s.A}
                hint={groupBits(toBin(s.A))}
                accent={s.zmiana === "A"}
              />
              <LabReadout
                label="B"
                value={s.B}
                hint={groupBits(toBin(s.B))}
                accent={s.zmiana === "B"}
              />
            </LabReadouts>
            <p className="flex flex-col gap-0.5 font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
              <span>PC: licznik rozkazów · IR: rejestr instrukcji</span>
              <span>
                wykonane instrukcje: {s.wykonane} / limit {LIMIT}
              </span>
            </p>
          </div>
        </div>

        {/* Konsola */}
        <div className="flex flex-col gap-2">
          <LabLabel>Konsola (wyjście)</LabLabel>
          <div
            ref={konsolaRef}
            role="log"
            aria-label="Wyjście programu"
            className="flex max-h-40 min-h-20 flex-col overflow-y-auto border bg-muted/50 px-3 py-2 font-mono text-sm text-signal-ink tabular-nums"
          >
            {s.wyjscie.map((w) => (
              <span key={w.id}>{w.tekst}</span>
            ))}
            {zatrzymany ? (
              <span className="text-xs text-muted-foreground">
                {s.stop === "halt"
                  ? "— program zakończony (HALT) —"
                  : s.stop === "limit"
                    ? "— zatrzymano przez bezpiecznik —"
                    : "— koniec pamięci programu —"}
              </span>
            ) : (
              <span className="animate-blink" aria-hidden>
                ▌
              </span>
            )}
          </div>
        </div>

        {/* Legenda */}
        <Collapsible>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                className="group/legenda -mx-2 w-fit text-muted-foreground"
              />
            }
          >
            <CaretDownIcon
              data-icon="inline-start"
              className="transition-transform duration-150 group-data-[panel-open]/legenda:rotate-180"
            />
            Lista instrukcji ({LEGENDA.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2 pt-2">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
                    Instrukcja
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
                    Kod
                  </TableHead>
                  <TableHead className="font-mono text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
                    Działanie
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LEGENDA.map((l) => (
                  <TableRow key={l.skladnia}>
                    <TableCell className="font-mono font-semibold">
                      {l.skladnia}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {l.kod}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {l.dzialanie}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs/relaxed text-muted-foreground">
              <code className="font-mono">R</code> to rejestr A albo B (w kodzie
              A = 0, B = 1), <code className="font-mono">n</code> to liczba,{" "}
              <code className="font-mono">adr</code> to adres instrukcji. Kod
              maszynowy ma 2 bajty: numer operacji z rejestrem i liczbę lub
              adres. Rejestry są 8-bitowe, więc mieszczą 0–255.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Lab>
  )
}
