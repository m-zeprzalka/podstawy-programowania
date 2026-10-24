"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  CheckIcon,
  SealCheckIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type QuizContextValue = {
  report: (id: string, correct: boolean | null) => void
}

const QuizContext = React.createContext<QuizContextValue | null>(null)

/** ✅ Mini-quiz: kontener dla `<Pytanie>` z licznikiem wyniku. */
export function Quiz({
  tytul = "Mini-quiz",
  children,
}: {
  tytul?: string
  children: React.ReactNode
}) {
  const [results, setResults] = React.useState<Record<string, boolean | null>>({})

  const value = React.useMemo<QuizContextValue>(
    () => ({
      report: (id, correct) =>
        setResults((prev) => (prev[id] === correct ? prev : { ...prev, [id]: correct })),
    }),
    []
  )

  const questions = React.Children.toArray(children).filter(React.isValidElement)
  const total = questions.length
  const correct = Object.values(results).filter((r) => r === true).length
  const complete = total > 0 && correct === total

  return (
    <QuizContext.Provider value={value}>
      <section
        aria-label={tytul}
        className="not-prose my-10 border-t-2 border-foreground"
      >
        <header className="flex items-center justify-between gap-3 py-3">
          <h2 className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide uppercase">
            <SealCheckIcon className="size-5" weight="duotone" />
            {tytul}
          </h2>
          <p
            className={cn(
              "flex items-center gap-1.5 font-mono text-xs tabular-nums",
              complete ? "text-signal-ink" : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {complete ? <CheckIcon weight="bold" /> : null}
            {correct}/{total} poprawnie
          </p>
        </header>
        <ol className="flex flex-col gap-3">
          {questions.map((child, i) =>
            React.cloneElement(child as React.ReactElement<{ numer?: number }>, {
              numer: i + 1,
            })
          )}
        </ol>
      </section>
    </QuizContext.Provider>
  )
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\s.,;:!?„”"'`]/g, "")
}

/**
 * Pytanie quizu. Jednokrotny wybór (`odpowiedzi` + `poprawna`)
 * albo odpowiedź wpisywana (`akceptowane`).
 */
export function Pytanie({
  pytanie,
  odpowiedzi,
  poprawna = 0,
  akceptowane,
  wyjasnienie,
  numer,
}: {
  /** Ustawiany automatycznie przez `<Quiz>`. */
  numer?: number
  pytanie: string
  odpowiedzi?: string[]
  /** Indeks poprawnej odpowiedzi (od 0). */
  poprawna?: number
  /** Akceptowane odpowiedzi tekstowe (bez względu na wielkość liter i spacje). */
  akceptowane?: string[]
  wyjasnienie?: string
}) {
  const ctx = React.useContext(QuizContext)
  const id = React.useId()
  const [choice, setChoice] = React.useState<number | null>(null)
  const [text, setText] = React.useState("")
  const [attempts, setAttempts] = React.useState(0)
  const [checked, setChecked] = React.useState<boolean | null>(null)

  const isText = Boolean(akceptowane?.length)

  React.useEffect(() => {
    ctx?.report(id, checked)
  }, [ctx, id, checked])

  const reset = () => {
    setChoice(null)
    setText("")
    setChecked(null)
  }

  const answer = (i: number) => {
    if (checked !== null) return
    setChoice(i)
    setChecked(i === poprawna)
  }

  const check = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const ok = (akceptowane ?? []).some((a) => normalize(a) === normalize(text))
    setAttempts((a) => a + 1)
    setChecked(ok)
  }

  const feedbackId = `${id}-feedback`

  return (
    <li className="border bg-card">
      <div className="flex gap-3 px-4 pt-4 md:px-5">
        {numer ? (
          <span className="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
            {String(numer).padStart(2, "0")}
          </span>
        ) : null}
        <p className="font-medium text-pretty">{pytanie}</p>
      </div>

      <div className="px-4 pt-3 pb-4 md:px-5">
        {isText ? (
          <form onSubmit={check} className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (checked === false) setChecked(null)
              }}
              aria-label="Twoja odpowiedź"
              aria-describedby={feedbackId}
              placeholder="Twoja odpowiedź"
              disabled={checked === true}
              className="h-10 font-mono md:h-9"
              autoComplete="off"
              spellCheck={false}
            />
            <Button type="submit" disabled={checked === true || !text.trim()}>
              Sprawdź
            </Button>
          </form>
        ) : (
          <div role="group" aria-label="Odpowiedzi" className="flex flex-col gap-2">
            {odpowiedzi?.map((option, i) => {
              const state =
                checked === null
                  ? "idle"
                  : i === poprawna
                    ? "correct"
                    : i === choice
                      ? "wrong"
                      : "dim"
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => answer(i)}
                  aria-pressed={choice === i}
                  aria-describedby={feedbackId}
                  disabled={checked !== null && state === "dim"}
                  className={cn(
                    "flex min-h-11 w-full items-start gap-3 border px-3 py-2.5 text-left text-[0.9375rem] transition-colors",
                    state === "idle" && "hover:border-foreground/40 hover:bg-muted/60",
                    state === "correct" && "border-signal bg-signal-soft",
                    state === "wrong" && "border-destructive bg-destructive/10",
                    state === "dim" && "opacity-55"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center border font-mono text-[0.6875rem]",
                      state === "correct" && "border-signal bg-signal text-signal-foreground",
                      state === "wrong" && "border-destructive bg-destructive text-background"
                    )}
                    aria-hidden
                  >
                    {state === "correct" ? (
                      <CheckIcon weight="bold" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                </button>
              )
            })}
          </div>
        )}

        <div id={feedbackId} aria-live="polite">
          {checked !== null ? (
            <div
              className={cn(
                "mt-3 flex items-start gap-2.5 text-[0.9375rem]/relaxed",
                checked ? "text-foreground" : "text-foreground"
              )}
            >
              {checked ? (
                <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-signal-ink" weight="fill" />
              ) : (
                <XCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" weight="fill" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p>
                  <span className="font-semibold">
                    {checked ? "Dobrze! " : isText ? "Jeszcze nie. " : "Nie tym razem. "}
                  </span>
                  {checked || !isText ? wyjasnienie : null}
                  {!checked && isText && attempts >= 2 ? (
                    <>
                      Odpowiedź: <span className="font-mono font-semibold">{akceptowane?.[0]}</span>.{" "}
                      {wyjasnienie}
                    </>
                  ) : null}
                  {!checked && isText && attempts < 2 ? "Spróbuj jeszcze raz." : null}
                </p>
                {!checked && !isText ? (
                  <Button variant="outline" size="sm" className="self-start" onClick={reset}>
                    <ArrowCounterClockwiseIcon data-icon="inline-start" />
                    Spróbuj ponownie
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  )
}
