# Playground: programy z kursu

Folder na ćwiczenia. W `lekcja-1/` są wszystkie programy z lekcji „Język C: od klocków do kodu”, ułożone według numerów modułów. Każdy plik to cały program, który od razu się skompiluje.

## Jak uruchomić program

```bash
cd playground/C/lekcja-1/03-pierwszy-program
gcc -Wall hello.c -o hello
./hello
```

Na Windowsie program uruchamiasz poleceniem `.\hello`. Wszystkie programy kompilują się bez ostrzeżeń w GCC z opcjami `-Wall -Wextra`. Wyjątek to `12-polskie-znaki/windows_utf8.c`, który działa tylko na Windowsie.

Skompilowane programy Git pomija (plik `.gitignore`), więc możesz kompilować w tych folderach bez obaw.

## Co jest w środku

| folder | programy |
|---|---|
| `03-pierwszy-program` | `hello.c`, `hello_komentarze.c`, `blad.c` (kod wyjścia) |
| `05-printf-i-scanf` | `witaj.c`, `wiek.c`, `wstawki.c`, `sprawdz_liczbe.c` |
| `06-typy-danych` | `rozmiary.c`, `znak_to_liczba.c`, `zmiana_wartosci.c`, `stala.c`, `witaj_na_sztywno.c`, `wizytowka.c` |
| `07-warunki` | `porownaj.c`, `zgoda.c`, `switch.c` |
| `08-petle` | `while.c`, `for.c`, `bez_konca.c` (przerwij Ctrl+C), `dodatnia.c` |
| `09-funkcje` | `miau.c`, `kwadrat.c`, `siatka.c` |
| `10-mario` | `pytajniki.c`, `kolumna.c`, `siatka.c`, `mario.c`, `schodki.c` |
| `11-operatory` | `kalkulator.c`, `rzutowanie.c`, `ulamki.c`, `podwajaj.c`, `podwajaj_long_long.c`, `granice.c` |
| `12-polskie-znaki` | `dlugosc.c`, `przecinek.c`, `windows_utf8.c` |
| `13-styl` | `styl_przed.c` i `styl_po.c`: ten sam program przed i po poprawieniu stylu |

Rozwiązań piramidy i reszty z zadania domowego tu nie ma. Te programy trzeba napisać samodzielnie.

## Jak ćwiczyć

1. Przepisz program z lekcji samodzielnie, zamiast go kopiować. Porównaj z plikiem w tym folderze dopiero wtedy, gdy coś nie działa.
2. Zmień jedną rzecz (liczbę, warunek, napis) i zgadnij wynik, zanim uruchomisz program.
3. Zepsuj program celowo, np. usuń średnik albo `&`, i przeczytaj komunikat kompilatora.
