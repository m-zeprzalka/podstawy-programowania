# Podstawy programowania: interaktywny kurs

Autorski kurs podstaw informatyki i programowania dla studentów. Treść żyje w plikach MDX, a aplikacja jest tylko „widokiem”.

**Stos:** Next.js 16 (App Router) · shadcn/ui (Base UI, styl `lyra`) · Tailwind CSS 4 · Fumadocs (MDX + nawigacja + wyszukiwarka) · IBM Plex Sans / Mono.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000, hot reload także dla plików .mdx
npm run build      # wersja produkcyjna
npm run lint
npm run typecheck
```

## Gdzie co jest

```
content/kurs/                     ← TREŚĆ (tu piszesz)
  meta.json                       ← kolejność lekcji
  lekcja-0/
    meta.json                     ← kolejność modułów lekcji
    index.mdx                     ← strona lekcji + lista źródeł (frontmatter `zrodla`)
    system-dwojkowy.mdx           ← moduł (jeden plik = jeden moduł)
    …
  lekcja-1/index.mdx              ← zapowiedź (status: wkrotce)

components/interaktywne/          ← PRZYKŁADY INTERAKTYWNE (tu kodujesz)
  index.ts                        ← rejestr: nazwa w MDX → komponent
  zarowki.tsx, tlumacz-ascii.tsx, scratch-skrypt.tsx, …
components/kurs/                  ← klocki treści (Cel, Quiz, Zrodlo…) i powłoka aplikacji
components/ui/                    ← komponenty shadcn/ui
lib/site.ts                       ← nazwa kursu, autor, uczelnia (do stopki z licencją)
lib/source.ts                     ← schemat frontmatteru (Fumadocs MDX)
```

## Nowy moduł

1. Utwórz plik, np. `content/kurs/lekcja-0/nowy-modul.mdx`:

   ```mdx
   ---
   title: Pełny tytuł modułu
   nav: Krótka nazwa w menu
   description: Jedno, dwa zdania zapowiedzi.
   czas: 8
   ---

   <Cel>Czego się nauczysz, w jednym zdaniu.</Cel>

   ## Pierwsza sekcja

   Tekst z przypisem do źródła lekcji.<Zrodlo n={4} />

   <Zarowki bity={8} wyzwanie={42} />
   ```

2. Dopisz `"nowy-modul"` w odpowiednim miejscu `content/kurs/lekcja-0/meta.json`.

Numer modułu, nawigacja, spis sekcji (z nagłówków `##` i `###`), postęp i wyszukiwarka aktualizują się same.

## Klocki dostępne w MDX (bez importów)

| klocek | do czego |
|---|---|
| `<Cel>…</Cel>` | cel modułu |
| `<Pojecia lista={[["bajt", "byte"], …]} />` | pojęcia PL / EN |
| `<NaZajeciach tytul="…" czas="5 min">…</NaZajeciach>` | ćwiczenie na sali (zwinięte; otwarte w trybie prowadzącego) |
| `<DlaProwadzacego>…</DlaProwadzacego>` | widoczne tylko w trybie prowadzącego |
| `<Dociekliwi tytul="…">…</Dociekliwi>` | rozszerzenie dla chętnych (zwinięte) |
| `<Uwaga>`, `<Wskazowka>`, `<Ramka typ="info">` | wyróżnione akapity |
| `<Zrodlo n={4} />`, `<Zrodlo n={[4, 7]} />` | przypis do źródła z `zrodla` w `index.mdx` lekcji |
| `<ListaZrodel />` | pełna lista źródeł lekcji |
| `<Quiz>` + `<Pytanie pytanie="…" odpowiedzi={[…]} poprawna={0} wyjasnienie="…" />` | mini-quiz (pytanie zamknięte) |
| `<Pytanie pytanie="…" akceptowane={["1101"]} wyjasnienie="…" />` | pytanie z wpisywaną odpowiedzią |

Przykłady interaktywne: `Zarowki`, `Palce`, `Kreski`, `CzarnaSkrzynka`, `SkadStartujesz`, `PromptPlayground`, `TlumaczAscii`, `RozbieraczEmoji`, `GeneratorKrzaczkow`, `SuwakiRgb`, `KalkulatorMediow`, `LicznikKilometrow`, `Zmiennoprzecinkowe`, `Tokenizer`, `ZgadnijLiczbe`, `WykresZlozonosci`, `KsiazkaTelefoniczna`, `ScratchSkrypt`, `ScratchEmbed`, `TlumaczKlockow`, `DopasujPojecia`, `Pamiec`, `Procesor`, `Slowniczek`, `ListaKontrolna`. Ich propsy opisują komentarze JSDoc w plikach `components/interaktywne/*.tsx`.

### Scratch jako tekst

Skrypty Scratcha piszesz zwykłym tekstem, a komponent rysuje klocki w kolorach kategorii:

```mdx
<ScratchSkrypt
  duszek="Kot"
  kod={`kiedy kliknięto zieloną flagę
powtórz (3) razy
    zagraj dźwięk [Miau] i czekaj`}
/>
```

`[tekst]` to pole tekstowe, `(liczba)` pole liczbowe, `<warunek>` klocek logiczny, wcięcie 4 spacje to wnętrze pętli lub warunku, pusta linia zaczyna nowy skrypt.

## Nowy przykład interaktywny

1. Utwórz `components/interaktywne/moj-przyklad.tsx` (`"use client"`, nazwany eksport, opakowanie `<Lab tytul="…">` z `components/kurs/lab.tsx`). Wzorcem jest `zarowki.tsx`.
2. Dopisz go w `components/interaktywne/index.ts`.
3. Użyj w MDX: `<MojPrzyklad />`.

## Tryb prowadzącego

Przełącznik w ustawieniach (koło zębate w nagłówku). Pokazuje bloki `<DlaProwadzacego>` i domyślnie rozwija `<NaZajeciach>`. Ustawienie i postęp nauki zapisują się w `localStorage` przeglądarki.

## Licencja

Lekcja 0 opracowuje materiały na licencji [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pl), więc cały kurs (z aplikacją) musi być udostępniany na tych samych warunkach i niekomercyjnie. Wymagana atrybucja jest jedna, w stopce (`atrybucja` w `lib/site.ts`); w treści lekcji jej nie powtarzamy. **Uzupełnij `autor` i `uczelnia` w `lib/site.ts`**, bo też trafiają do stopki.
