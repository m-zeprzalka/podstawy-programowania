/** Pomocnicze dane i funkcje dla przykładów z modułów 1–5 lekcji 0 („wstęp”). */

/**
 * Polska odmiana rzeczownika przez liczbę:
 * odmiana(1, "litera", "litery", "liter") → "litera",
 * odmiana(3, …) → "litery", odmiana(5, …) / odmiana(12, …) → "liter".
 */
export function odmiana(
  n: number,
  jeden: string,
  kilka: string,
  wiele: string
) {
  const abs = Math.abs(n)
  if (abs === 1) return jeden
  const r10 = abs % 10
  const r100 = abs % 100
  if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return kilka
  return wiele
}

/** Poziomy samooceny w ankiecie startowej. */
export const POZIOMY_STARTU = [
  {
    id: "mniej",
    etykieta: "Mniej pewnie",
    en: "less comfortable",
    opis: "Programowanie to dla mnie nowość albo prawie nowość.",
    komentarz:
      "Tak zaczyna większość osób na tym kursie – jest napisany właśnie z myślą o tobie.",
  },
  {
    id: "pomiedzy",
    etykieta: "Gdzieś pomiędzy",
    en: "somewhere in between",
    opis: "Mam za sobą pierwsze próby, ale bez systematycznej nauki.",
    komentarz:
      "Pierwsze próby masz za sobą – tutaj je uporządkujesz i uzupełnisz luki.",
  },
  {
    id: "bardziej",
    etykieta: "Bardziej pewnie",
    en: "more comfortable",
    opis: "Programuję regularnie i znam podstawy.",
    komentarz:
      "Podstawy już masz – zaglądaj do bloków „Dla dociekliwych” i tłumacz innym, to najlepszy test zrozumienia.",
  },
] as const

export type PoziomStartu = (typeof POZIOMY_STARTU)[number]["id"]
