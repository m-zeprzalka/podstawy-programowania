/**
 * Programy do laboratorium „Krok po kroku”.
 * Każdy krok to stan po wykonaniu podświetlonego fragmentu kodu:
 * które zmienne istnieją, co jest na ekranie i co się właśnie stało.
 */

export type Zmienna = {
  nazwa: string
  wartosc: string
  /** Funkcja albo blok, w którym zmienna żyje, np. "main" albo "pętla". */
  gdzie: string
}

export type Krok = {
  /** Numer linijki w `kod` (od 0). */
  linia: number
  /** Podświetlony fragment linijki: znaki od `od` do `do` (bez `do`). */
  od: number
  do: number
  zmienne: Zmienna[]
  wyjscie: string
  opis: string
}

export type ProgramKrokowy = {
  tytul: string
  opis: string
  kod: string[]
  kroki: Krok[]
}

type Rejestrator = {
  /** Podświetl `fragment` (jego `ktory` wystąpienie w kodzie) i zapisz krok. */
  krok: (fragment: string, opis: string, ktory?: number) => void
  /** Podświetl całą linijkę o numerze `linia`. */
  krokLinia: (linia: number, opis: string) => void
  ustaw: (nazwa: string, wartosc: string | number, gdzie: string) => void
  usun: (...nazwy: string[]) => void
  wypisz: (tekst: string) => void
}

function nagraj(kod: string[], scenariusz: (r: Rejestrator) => void): Krok[] {
  const kroki: Krok[] = []
  let zmienne: Zmienna[] = []
  let wyjscie = ""

  const zapisz = (linia: number, od: number, doZnaku: number, opis: string) =>
    kroki.push({
      linia,
      od,
      do: doZnaku,
      zmienne: zmienne.map((z) => ({ ...z })),
      wyjscie,
      opis,
    })

  scenariusz({
    krok(fragment, opis, ktory = 1) {
      let znalezione = 0
      for (let nr = 0; nr < kod.length; nr++) {
        const od = kod[nr].indexOf(fragment)
        if (od >= 0 && ++znalezione === ktory) {
          zapisz(nr, od, od + fragment.length, opis)
          return
        }
      }
      throw new Error(`Krok po kroku: brak fragmentu „${fragment}”`)
    },
    krokLinia(linia, opis) {
      const tekst = kod[linia]
      const od = tekst.length - tekst.trimStart().length
      zapisz(linia, od, tekst.length, opis)
    },
    ustaw(nazwa, wartosc, gdzie) {
      const z = zmienne.find((v) => v.nazwa === nazwa && v.gdzie === gdzie)
      if (z) z.wartosc = String(wartosc)
      else zmienne.push({ nazwa, wartosc: String(wartosc), gdzie })
    },
    usun(...nazwy) {
      zmienne = zmienne.filter((z) => !nazwy.includes(z.nazwa))
    },
    wypisz(tekst) {
      wyjscie += tekst
    },
  })
  return kroki
}

/* ---------- while ---------- */

const KOD_WHILE = [
  "int licznik = 0;",
  "while (licznik < 3)",
  "{",
  '    printf("miau\\n");',
  "    licznik++;",
  "}",
  'printf("Koniec!\\n");',
]

const WHILE = nagraj(KOD_WHILE, (r) => {
  r.ustaw("licznik", 0, "main")
  r.krok(
    "int licznik = 0;",
    "Tworzymy zmienną licznik i od razu wpisujemy do niej 0."
  )
  for (let licznik = 0; licznik < 3; licznik++) {
    r.krok(
      "licznik < 3",
      `Sprawdzamy warunek: czy ${licznik} < 3? Tak, więc wchodzimy do środka pętli.`
    )
    r.wypisz("miau\n")
    r.krok(
      'printf("miau\\n");',
      "Wypisujemy miau i przechodzimy do nowej linii."
    )
    r.ustaw("licznik", licznik + 1, "main")
    r.krok(
      "licznik++;",
      `licznik++ zwiększa licznik o 1. Teraz licznik = ${licznik + 1}. Wracamy do warunku.`
    )
  }
  r.krok(
    "licznik < 3",
    "Sprawdzamy warunek: czy 3 < 3? Nie. Pętla się kończy, program przeskakuje za zamykającą klamrę."
  )
  r.wypisz("Koniec!\n")
  r.krok(
    'printf("Koniec!\\n");',
    "Program idzie dalej, do pierwszej linijki za pętlą."
  )
})

/* ---------- for ---------- */

const KOD_FOR = [
  "for (int i = 0; i < 3; i++)",
  "{",
  '    printf("miau\\n");',
  "}",
  'printf("Koniec!\\n");',
]

const FOR = nagraj(KOD_FOR, (r) => {
  r.ustaw("i", 0, "pętla")
  r.krok(
    "int i = 0",
    "Początek: tworzymy licznik i i wpisujemy do niego 0. Ta część wykonuje się tylko raz."
  )
  for (let i = 0; i < 3; i++) {
    r.krok("i < 3", `Warunek: czy ${i} < 3? Tak, więc wykonujemy środek pętli.`)
    r.wypisz("miau\n")
    r.krok('printf("miau\\n");', `Wypisujemy miau. To obrót numer ${i + 1}.`)
    r.ustaw("i", i + 1, "pętla")
    r.krok(
      "i++",
      `Krok: i++ zwiększa i o 1, teraz i = ${i + 1}. Zauważ, że ta część stoi na początku linijki, ale działa po każdym obrocie.`
    )
  }
  r.krok("i < 3", "Warunek: czy 3 < 3? Nie. Pętla się kończy.")
  r.usun("i")
  r.wypisz("Koniec!\n")
  r.krok(
    'printf("Koniec!\\n");',
    "Program idzie dalej. Zmiennej i już nie ma: istniała tylko w pętli."
  )
})

/* ---------- pętla w pętli ---------- */

const KOD_SIATKA = [
  "for (int i = 0; i < 2; i++)",
  "{",
  "    for (int j = 0; j < 3; j++)",
  "    {",
  '        printf("#");',
  "    }",
  '    printf("\\n");',
  "}",
]

const SIATKA = nagraj(KOD_SIATKA, (r) => {
  r.ustaw("i", 0, "pętla i")
  r.krok("int i = 0", "Zewnętrzna pętla tworzy licznik rzędów i = 0.")
  for (let i = 0; i < 2; i++) {
    r.krok("i < 2", `Czy ${i} < 2? Tak, rysujemy rząd numer ${i + 1}.`)
    r.ustaw("j", 0, "pętla j")
    r.krok("int j = 0", "Wewnętrzna pętla zaczyna od nowa: j = 0.")
    for (let j = 0; j < 3; j++) {
      r.krok("j < 3", `Czy ${j} < 3? Tak, stawiamy cegłę.`)
      r.wypisz("#")
      r.krok(
        'printf("#");',
        "Wypisujemy # bez nowej linii, więc cegły stoją obok siebie."
      )
      r.ustaw("j", j + 1, "pętla j")
      r.krok("j++", `j++: teraz j = ${j + 1}.`)
    }
    r.krok(
      "j < 3",
      "Czy 3 < 3? Nie. Wewnętrzna pętla się kończy, rząd jest gotowy."
    )
    r.usun("j")
    r.wypisz("\n")
    r.krok(
      'printf("\\n");',
      "Przechodzimy do nowej linii. Zmiennej j już nie ma, przy następnym rzędzie powstanie od nowa."
    )
    r.ustaw("i", i + 1, "pętla i")
    r.krok(
      "i++",
      `i++: teraz i = ${i + 1}. Wracamy do warunku zewnętrznej pętli.`
    )
  }
  r.krok("i < 2", "Czy 2 < 2? Nie. Siatka 2 × 3 jest gotowa: 6 cegieł.")
})

/* ---------- funkcja bez wyniku ---------- */

const KOD_MIAU = [
  "#include <stdio.h>",
  "",
  "void miau(int n);",
  "",
  "int main(void)",
  "{",
  "    miau(3);",
  '    printf("Koniec!\\n");',
  "}",
  "",
  "void miau(int n)",
  "{",
  "    for (int i = 0; i < n; i++)",
  "    {",
  '        printf("miau\\n");',
  "    }",
  "}",
]

const MIAU = nagraj(KOD_MIAU, (r) => {
  r.krok(
    "int main(void)",
    "Program zawsze zaczyna się od main. Prototyp nad main to tylko zapowiedź dla kompilatora, niczego nie wykonuje."
  )
  r.krok(
    "miau(3);",
    "Wywołanie: skaczemy do funkcji miau i dajemy jej liczbę 3."
  )
  r.ustaw("n", 3, "miau")
  r.krok(
    "void miau(int n)",
    "Jesteśmy w funkcji miau. Parametr n dostał wartość 3.",
    2
  )
  r.ustaw("i", 0, "miau")
  r.krok("int i = 0", "Pętla w funkcji tworzy licznik i = 0.")
  for (let i = 0; i < 3; i++) {
    r.krok("i < n", `Czy ${i} < n, czyli ${i} < 3? Tak.`)
    r.wypisz("miau\n")
    r.krok('printf("miau\\n");', "Wypisujemy miau.")
    r.ustaw("i", i + 1, "miau")
    r.krok("i++", `i++: teraz i = ${i + 1}.`)
  }
  r.krok("i < n", "Czy 3 < 3? Nie. Pętla się kończy.")
  r.usun("i")
  r.krokLinia(
    KOD_MIAU.length - 1,
    "Koniec funkcji miau. Jej zmienne znikają, a program wraca do main, tuż za wywołanie."
  )
  r.usun("n")
  r.wypisz("Koniec!\n")
  r.krok(
    'printf("Koniec!\\n");',
    "Z powrotem w main. Zmiennych n i i już nie ma."
  )
})

/* ---------- funkcja z wynikiem ---------- */

const KOD_KWADRAT = [
  "#include <stdio.h>",
  "",
  "int kwadrat(int x)",
  "{",
  "    return x * x;",
  "}",
  "",
  "int main(void)",
  "{",
  "    int wynik = kwadrat(5);",
  '    printf("%d\\n", wynik);',
  "}",
]

const KWADRAT = nagraj(KOD_KWADRAT, (r) => {
  r.krok(
    "int main(void)",
    "Start zawsze w main. Funkcja kwadrat stoi wyżej, ale sama się nie uruchomi, dopóki ktoś jej nie wywoła."
  )
  r.krok(
    "kwadrat(5)",
    "Żeby wpisać coś do zmiennej wynik, trzeba najpierw obliczyć kwadrat(5). Skaczemy do funkcji."
  )
  r.ustaw("x", 5, "kwadrat")
  r.krok(
    "int kwadrat(int x)",
    "Jesteśmy w funkcji kwadrat. Parametr x dostał wartość 5."
  )
  r.krok(
    "return x * x;",
    "Liczymy x * x, czyli 5 * 5 = 25. return kończy funkcję i oddaje 25 tam, skąd ją wywołano."
  )
  r.usun("x")
  r.ustaw("wynik", 25, "main")
  r.krok(
    "int wynik = kwadrat(5);",
    "Z powrotem w main. kwadrat(5) zamienia się na 25, więc wynik = 25. Zmiennej x już nie ma."
  )
  r.wypisz("25\n")
  r.krok(
    'printf("%d\\n", wynik);',
    "Wypisujemy wartość zmiennej wynik w miejscu wstawki %d."
  )
})

export const PROGRAMY_KROKOWE = {
  while: {
    tytul: "Krok po kroku: pętla while",
    opis: "Klikaj „Dalej” i obserwuj, która część kodu właśnie działa i jak zmienia się licznik.",
    kod: KOD_WHILE,
    kroki: WHILE,
  },
  for: {
    tytul: "Krok po kroku: pętla for",
    opis: "Trzy części w nawiasie for działają w różnych chwilach. Klikaj „Dalej” i patrz, która z nich jest podświetlona.",
    kod: KOD_FOR,
    kroki: FOR,
  },
  siatka: {
    tytul: "Krok po kroku: pętla w pętli",
    opis: "Siatka 2 × 3, żeby było krócej. Wewnętrzna pętla wykonuje się w całości przy każdym obrocie zewnętrznej.",
    kod: KOD_SIATKA,
    kroki: SIATKA,
  },
  miau: {
    tytul: "Krok po kroku: wywołanie funkcji",
    opis: "Zobacz, jak program skacze z main do funkcji i z powrotem. Kolumna „gdzie” pokazuje, w której funkcji żyje zmienna.",
    kod: KOD_MIAU,
    kroki: MIAU,
  },
  kwadrat: {
    tytul: "Krok po kroku: return",
    opis: "Funkcja oblicza wynik i oddaje go do main. Klikaj „Dalej” i patrz, skąd bierze się wartość zmiennej wynik.",
    kod: KOD_KWADRAT,
    kroki: KWADRAT,
  },
} satisfies Record<string, ProgramKrokowy>

export type ProgramKrokowyId = keyof typeof PROGRAMY_KROKOWE
