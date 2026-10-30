/**
 * Kategorie bloków Scratcha 3.0 i rozpoznawanie bloku po jego tekście.
 *
 * Blok rozpoznajemy po „sygnaturze”: tekście linii, w którym każde pole
 * (`[…]`, `(…)`, `<…>`) zastąpiono znakiem `_`, np.
 * `powiedz (połącz [Cześć, ] i (odpowiedź))` → `powiedz _`,
 * `zmień [wynik] o (1)` → `zmień _ o _`, a `zmień y o (-1)` → `zmień y o _`.
 */

export type KategoriaScratch =
  | "ruch"
  | "wyglad"
  | "dzwiek"
  | "zdarzenia"
  | "kontrola"
  | "czujniki"
  | "wyrazenia"
  | "zmienne"
  | "bloki"
  | "rozszerzenia"
  | "nieznana"

/**
 * Kształt bloku:
 * - `stos` — zwykły blok z wcięciem u góry i wypustem u dołu,
 * - `kapelusz` — „kiedy …” (zaokrąglony garb u góry),
 * - `definicja` — „definiuj …” (Moje bloki),
 * - `c` / `c-koniec` — blok C („powtórz”, „jeżeli”; „zawsze” bez dolnego wypustu),
 * - `koniec` — blok kończący stos (bez dolnego wypustu),
 * - `reporter` — owalny blok zwracający wartość,
 * - `warunek` — sześciokątne wyrażenie logiczne.
 */
export type KsztaltScratch =
  | "stos"
  | "kapelusz"
  | "definicja"
  | "c"
  | "c-koniec"
  | "koniec"
  | "reporter"
  | "warunek"

/**
 * Zmienne koloru bloku. Każdy element, który zmienia kategorię, ustawia
 * `--sb` (wypełnienie) i `--sb-o` (siłę obwódki) oraz klasy {@link POCHODNE}:
 * `--sb-c` (obwódka), `--sb-m` (rozwijana lista / pusty slot),
 * `--sb-t` (cień tekstu dla kontrastu bieli na jasnych kolorach).
 * Kolory Scratcha są stałe w obu motywach — jak w oficjalnym edytorze.
 */
export const POCHODNE =
  "[--sb-c:color-mix(in_oklch,var(--sb)_var(--sb-o),black)] [--sb-m:color-mix(in_oklch,var(--sb)_86%,black)] [--sb-t:color-mix(in_oklch,var(--sb)_42%,black)]"

export const KATEGORIE: Record<
  KategoriaScratch,
  { nazwa: string; en: string; tlo: string; zmienne: string }
> = {
  ruch: {
    nazwa: "Ruch",
    en: "Motion",
    tlo: "bg-scratch-ruch",
    zmienne: "[--sb:var(--color-scratch-ruch)] [--sb-o:80%]",
  },
  wyglad: {
    nazwa: "Wygląd",
    en: "Looks",
    tlo: "bg-scratch-wyglad",
    zmienne: "[--sb:var(--color-scratch-wyglad)] [--sb-o:80%]",
  },
  dzwiek: {
    nazwa: "Dźwięk",
    en: "Sound",
    tlo: "bg-scratch-dzwiek",
    zmienne: "[--sb:var(--color-scratch-dzwiek)] [--sb-o:80%]",
  },
  zdarzenia: {
    nazwa: "Zdarzenia",
    en: "Events",
    tlo: "bg-scratch-zdarzenia",
    zmienne: "[--sb:var(--color-scratch-zdarzenia)] [--sb-o:68%]",
  },
  kontrola: {
    nazwa: "Kontrola",
    en: "Control",
    tlo: "bg-scratch-kontrola",
    zmienne: "[--sb:var(--color-scratch-kontrola)] [--sb-o:68%]",
  },
  czujniki: {
    nazwa: "Czujniki",
    en: "Sensing",
    tlo: "bg-scratch-czujniki",
    zmienne: "[--sb:var(--color-scratch-czujniki)] [--sb-o:76%]",
  },
  wyrazenia: {
    nazwa: "Wyrażenia",
    en: "Operators",
    tlo: "bg-scratch-wyrazenia",
    zmienne: "[--sb:var(--color-scratch-wyrazenia)] [--sb-o:76%]",
  },
  zmienne: {
    nazwa: "Zmienne",
    en: "Variables",
    tlo: "bg-scratch-zmienne",
    zmienne: "[--sb:var(--color-scratch-zmienne)] [--sb-o:76%]",
  },
  bloki: {
    nazwa: "Moje bloki",
    en: "My Blocks",
    tlo: "bg-scratch-bloki",
    zmienne: "[--sb:var(--color-scratch-bloki)] [--sb-o:78%]",
  },
  rozszerzenia: {
    nazwa: "Rozszerzenia",
    en: "Extensions",
    tlo: "bg-scratch-rozszerzenia",
    zmienne: "[--sb:var(--color-scratch-rozszerzenia)] [--sb-o:76%]",
  },
  nieznana: {
    nazwa: "Nieznany blok",
    en: "Unknown block",
    tlo: "bg-chart-5",
    zmienne: "[--sb:var(--chart-5)] [--sb-o:78%]",
  },
}

/** Kolejność kategorii jak w palecie Scratcha (legenda). */
export const KOLEJNOSC_KATEGORII: KategoriaScratch[] = [
  "ruch",
  "wyglad",
  "dzwiek",
  "zdarzenia",
  "kontrola",
  "czujniki",
  "wyrazenia",
  "zmienne",
  "bloki",
  "rozszerzenia",
  "nieznana",
]

type Wzor = {
  re: RegExp
  kat: KategoriaScratch
  /** Domyślnie `stos`. */
  ksztalt?: KsztaltScratch
  /** Pola `[…]` tego bloku to rozwijane listy (▾), a nie pola tekstowe. */
  menu?: boolean
}

/**
 * Wzorce sygnatur — pierwszy pasujący wygrywa, więc kolejność ma znaczenie.
 * `(?![\p{L}\d])` zamiast `\b`, bo `\b` nie rozpoznaje polskich liter („obróć”).
 */
const WZORY: Wzor[] = [
  // Kapelusze
  { re: /^kiedy zaczynam jako klon/u, kat: "kontrola", ksztalt: "kapelusz" },
  {
    re: /^kiedy (ruch wideo|wideo)/u,
    kat: "rozszerzenia",
    ksztalt: "kapelusz",
    menu: true,
  },
  {
    re: /^kiedy(?![\p{L}\d])/u,
    kat: "zdarzenia",
    ksztalt: "kapelusz",
    menu: true,
  },
  { re: /^definiuj(?![\p{L}\d])/u, kat: "bloki", ksztalt: "definicja" },
  // Zdarzenia
  { re: /^nadaj(?![\p{L}\d])/u, kat: "zdarzenia", menu: true },

  // Kontrola
  { re: /^zawsze$/u, kat: "kontrola", ksztalt: "c-koniec" },
  { re: /^powtórz _ razy$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^powtarzaj aż _$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^jeżeli _ to$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^w przeciwnym razie$/u, kat: "kontrola" },
  { re: /^czekaj(?![\p{L}\d])/u, kat: "kontrola" },
  { re: /^utwórz klon(?![\p{L}\d])/u, kat: "kontrola", menu: true },
  { re: /^usuń tego klona/u, kat: "kontrola", ksztalt: "koniec" },
  { re: /^zatrzymaj wszystkie dźwięki/u, kat: "dzwiek" },
  {
    re: /^zatrzymaj(?![\p{L}\d])/u,
    kat: "kontrola",
    ksztalt: "koniec",
    menu: true,
  },

  // Zmienne (przed Wyglądem: „pokaż zmienną” ≠ „pokaż”)
  {
    re: /^(pokaż|ukryj) (zmienną|listę)(?![\p{L}\d])/u,
    kat: "zmienne",
    menu: true,
  },
  { re: /^(ustaw|zmień) _ (na|o) _$/u, kat: "zmienne", menu: true },
  { re: /^dodaj _ do _$/u, kat: "zmienne", menu: true },

  // Wygląd
  { re: /^(powiedz|myśl)(?![\p{L}\d])/u, kat: "wyglad" },
  {
    re: /^(zmień|ustaw) (kostium|tło)(?![\p{L}\d])/u,
    kat: "wyglad",
    menu: true,
  },
  { re: /^następn(y kostium|e tło)/u, kat: "wyglad" },
  { re: /^(pokaż|ukryj)$/u, kat: "wyglad" },
  { re: /^(zmień|ustaw) rozmiar(?![\p{L}\d])(?! pisaka)/u, kat: "wyglad" },
  {
    re: /^(zmień|ustaw) efekt(?![\p{L}\d])(?! dźwięku)/u,
    kat: "wyglad",
    menu: true,
  },
  { re: /^wyczyść efekty graficzne/u, kat: "wyglad" },
  { re: /^idź na (warstwę|wierzch|spód)/u, kat: "wyglad", menu: true },
  {
    re: /^(kostium|tło|rozmiar)( _)?$/u,
    kat: "wyglad",
    ksztalt: "reporter",
    menu: true,
  },

  // Dźwięk
  { re: /^zagraj dźwięk(?![\p{L}\d])/u, kat: "dzwiek", menu: true },
  {
    re: /^(zmień|ustaw) (głośność|efekt dźwięku)(?![\p{L}\d])/u,
    kat: "dzwiek",
    menu: true,
  },

  // Ruch
  { re: /^przesuń o _ kroków/u, kat: "ruch" },
  { re: /^obróć(?![\p{L}\d])/u, kat: "ruch" },
  { re: /^idź do x:/u, kat: "ruch" },
  { re: /^idź do _$/u, kat: "ruch", menu: true },
  { re: /^leć(?![\p{L}\d])/u, kat: "ruch", menu: true },
  { re: /^zmień (x|y) o _$/u, kat: "ruch" },
  { re: /^ustaw (x|y) na _$/u, kat: "ruch" },
  { re: /^ustaw kierunek(?![\p{L}\d])/u, kat: "ruch" },
  { re: /^ustaw w stronę(?![\p{L}\d])/u, kat: "ruch", menu: true },
  { re: /^jeżeli na brzegu/u, kat: "ruch" },
  { re: /^ustaw styl obrotu/u, kat: "ruch", menu: true },
  { re: /^(pozycja x|pozycja y|kierunek)$/u, kat: "ruch", ksztalt: "reporter" },

  // Czujniki
  { re: /^zapytaj(?![\p{L}\d])/u, kat: "czujniki" },
  { re: /^ustaw tryb przeciągania/u, kat: "czujniki", menu: true },
  { re: /^resetuj stoper/u, kat: "czujniki" },
  {
    re: /^dotyka(?![\p{L}\d])/u,
    kat: "czujniki",
    ksztalt: "warunek",
    menu: true,
  },
  {
    re: /^klawisz _ naciśnięty/u,
    kat: "czujniki",
    ksztalt: "warunek",
    menu: true,
  },
  { re: /^(myszka|mysz) .*wciśnięt/u, kat: "czujniki", ksztalt: "warunek" },
  {
    re: /^(odpowiedź|stoper|x myszy|y myszy|głośność|nazwa użytkownika)$/u,
    kat: "czujniki",
    ksztalt: "reporter",
  },
  {
    re: /^odległość od(?![\p{L}\d])/u,
    kat: "czujniki",
    ksztalt: "reporter",
    menu: true,
  },

  // Wyrażenia
  { re: /^połącz(?![\p{L}\d])/u, kat: "wyrazenia", ksztalt: "reporter" },
  { re: /^losuj od(?![\p{L}\d])/u, kat: "wyrazenia", ksztalt: "reporter" },
  { re: /^_ (lub|i|or|and) _$/u, kat: "wyrazenia", ksztalt: "warunek" },
  { re: /^nie _$/u, kat: "wyrazenia", ksztalt: "warunek" },
  { re: /^_ [<>=] _$/u, kat: "wyrazenia", ksztalt: "warunek" },
  { re: /^_ zawiera _\??$/u, kat: "wyrazenia", ksztalt: "warunek" },
  { re: /^_ ([-+*/]|mod) _$/u, kat: "wyrazenia", ksztalt: "reporter" },
  {
    re: /^(zaokrąglij|długość|litera)(?![\p{L}\d])/u,
    kat: "wyrazenia",
    ksztalt: "reporter",
  },

  // Rozszerzenia: Tekst na mowę, Czujnik wideo, Pióro
  { re: /^(wypowiedz|mów)(?![\p{L}\d])/u, kat: "rozszerzenia" },
  { re: /^ustaw (głos|język)(?![\p{L}\d])/u, kat: "rozszerzenia", menu: true },
  {
    re: /^(włącz|wyłącz) (wideo|kamerę)|^ustaw przezroczystość wideo/u,
    kat: "rozszerzenia",
    menu: true,
  },
  {
    re: /^(ruch|kierunek) wideo(?![\p{L}\d])/u,
    kat: "rozszerzenia",
    ksztalt: "reporter",
    menu: true,
  },
  {
    re: /^(przyłóż|podnieś) pisak|^pieczątka$|^wyczyść$/u,
    kat: "rozszerzenia",
  },
  {
    re: /^(zmień|ustaw) (kolor|rozmiar) pisaka/u,
    kat: "rozszerzenia",
    menu: true,
  },

  /* ---------- Scratch po angielsku ---------- */

  // Kapelusze
  { re: /^when i start as a clone/u, kat: "kontrola", ksztalt: "kapelusz" },
  {
    re: /^when video motion/u,
    kat: "rozszerzenia",
    ksztalt: "kapelusz",
    menu: true,
  },
  {
    re: /^when(?![\p{L}\d])/u,
    kat: "zdarzenia",
    ksztalt: "kapelusz",
    menu: true,
  },
  { re: /^define(?![\p{L}\d])/u, kat: "bloki", ksztalt: "definicja" },
  { re: /^broadcast(?![\p{L}\d])/u, kat: "zdarzenia", menu: true },

  // Rozszerzenia przed Ruchem: „turn video” ≠ „turn”
  {
    re: /^turn video|^set video transparency/u,
    kat: "rozszerzenia",
    menu: true,
  },
  {
    re: /^video _ on _$/u,
    kat: "rozszerzenia",
    ksztalt: "reporter",
    menu: true,
  },
  { re: /^speak(?![\p{L}\d])/u, kat: "rozszerzenia" },
  { re: /^set (voice|language) to/u, kat: "rozszerzenia", menu: true },
  { re: /^pen (down|up)$|^stamp$|^erase all$/u, kat: "rozszerzenia" },
  { re: /^(change|set) pen(?![\p{L}\d])/u, kat: "rozszerzenia", menu: true },

  // Kontrola
  { re: /^forever$/u, kat: "kontrola", ksztalt: "c-koniec" },
  { re: /^repeat until _$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^repeat _$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^if _ then$/u, kat: "kontrola", ksztalt: "c" },
  { re: /^else$/u, kat: "kontrola" },
  { re: /^wait(?![\p{L}\d])/u, kat: "kontrola" },
  { re: /^create clone of(?![\p{L}\d])/u, kat: "kontrola", menu: true },
  { re: /^delete this clone/u, kat: "kontrola", ksztalt: "koniec" },
  { re: /^stop all sounds/u, kat: "dzwiek" },
  { re: /^stop(?![\p{L}\d])/u, kat: "kontrola", ksztalt: "koniec", menu: true },

  // Zmienne (przed Wyglądem: „show variable” ≠ „show”)
  {
    re: /^(show|hide) (variable|list)(?![\p{L}\d])/u,
    kat: "zmienne",
    menu: true,
  },
  { re: /^(set|change) _ (to|by) _$/u, kat: "zmienne", menu: true },
  { re: /^add _ to _$/u, kat: "zmienne", menu: true },

  // Wygląd
  { re: /^(say|think)(?![\p{L}\d])/u, kat: "wyglad" },
  { re: /^switch (costume|backdrop) to/u, kat: "wyglad", menu: true },
  { re: /^next (costume|backdrop)/u, kat: "wyglad" },
  { re: /^(show|hide)$/u, kat: "wyglad" },
  { re: /^(change|set) size (by|to)/u, kat: "wyglad" },
  { re: /^(change|set) _ effect (by|to)/u, kat: "wyglad", menu: true },
  { re: /^clear graphic effects/u, kat: "wyglad" },
  { re: /^go to _ layer|^go _ _ layers/u, kat: "wyglad", menu: true },
  {
    re: /^(costume|backdrop) _$|^size$/u,
    kat: "wyglad",
    ksztalt: "reporter",
    menu: true,
  },

  // Dźwięk
  { re: /^(play|start) sound(?![\p{L}\d])/u, kat: "dzwiek", menu: true },
  { re: /^(change|set) volume/u, kat: "dzwiek" },

  // Ruch
  { re: /^move _ steps/u, kat: "ruch" },
  { re: /^turn(?![\p{L}\d])/u, kat: "ruch" },
  { re: /^go to x:/u, kat: "ruch" },
  { re: /^go to _$/u, kat: "ruch", menu: true },
  { re: /^glide(?![\p{L}\d])/u, kat: "ruch", menu: true },
  { re: /^change (x|y) by _$/u, kat: "ruch" },
  { re: /^set (x|y) to _$/u, kat: "ruch" },
  { re: /^point in direction/u, kat: "ruch" },
  { re: /^point towards/u, kat: "ruch", menu: true },
  { re: /^if on edge, bounce/u, kat: "ruch" },
  { re: /^set rotation style/u, kat: "ruch", menu: true },
  {
    re: /^(x position|y position|direction)$/u,
    kat: "ruch",
    ksztalt: "reporter",
  },

  // Czujniki
  { re: /^ask(?![\p{L}\d])/u, kat: "czujniki" },
  { re: /^set drag mode/u, kat: "czujniki", menu: true },
  { re: /^reset timer/u, kat: "czujniki" },
  {
    re: /^touching(?![\p{L}\d])/u,
    kat: "czujniki",
    ksztalt: "warunek",
    menu: true,
  },
  { re: /^key _ pressed/u, kat: "czujniki", ksztalt: "warunek", menu: true },
  { re: /^mouse down/u, kat: "czujniki", ksztalt: "warunek" },
  {
    re: /^(answer|timer|mouse x|mouse y|loudness|username)$/u,
    kat: "czujniki",
    ksztalt: "reporter",
  },
  {
    re: /^distance to(?![\p{L}\d])/u,
    kat: "czujniki",
    ksztalt: "reporter",
    menu: true,
  },

  // Wyrażenia
  { re: /^join(?![\p{L}\d])/u, kat: "wyrazenia", ksztalt: "reporter" },
  { re: /^pick random(?![\p{L}\d])/u, kat: "wyrazenia", ksztalt: "reporter" },
  { re: /^not _$/u, kat: "wyrazenia", ksztalt: "warunek" },
  {
    re: /^(round|length of|letter)(?![\p{L}\d])/u,
    kat: "wyrazenia",
    ksztalt: "reporter",
  },
]

export type Rozpoznanie = {
  kat: KategoriaScratch
  ksztalt: KsztaltScratch
  menu: boolean
}

/** Rozpoznaje blok po sygnaturze; `null`, gdy żaden wzorzec nie pasuje. */
export function rozpoznajBlok(sygnatura: string): Rozpoznanie | null {
  const s = sygnatura.trim().toLowerCase()
  for (const w of WZORY) {
    if (w.re.test(s)) {
      return { kat: w.kat, ksztalt: w.ksztalt ?? "stos", menu: Boolean(w.menu) }
    }
  }
  return null
}

/** Bloki C (obejmujące wcięte dzieci). */
export const czyBlokC = (k: KsztaltScratch) => k === "c" || k === "c-koniec"

const NAZWY_KOMENTARZY = new Set(
  [
    ...Object.values(KATEGORIE).flatMap((k) => [k.nazwa, k.en]),
    "Pióro",
    "Muzyka",
    "Tekst na mowę",
    "Czujnik wideo",
    "Pen",
    "Music",
    "Text to Speech",
    "Video Sensing",
  ].map((n) => n.toLowerCase())
)

/** „(Zdarzenia)”, „(Wygląd + Wyrażenia)” — komentarz z nazwą kategorii. */
export function czyKomentarzKategorii(tekst: string) {
  return tekst
    .split(/\s*[+,/]\s*/)
    .every((czesc) => NAZWY_KOMENTARZY.has(czesc.trim().toLowerCase()))
}
