#include <stdio.h>

int main(void)
{
    int wiek;         // deklaracja: zmienna jest, ale bez sensownej wartości
    wiek = 20;        // przypisanie: teraz w zmiennej wiek jest 20
    printf("wiek = %d\n", wiek);

    int licznik = 0;          // deklaracja z wartością początkową
    licznik = licznik + 1;    // weź licznik, dodaj 1, wpisz wynik z powrotem
    licznik += 1;             // to samo, krócej
    licznik++;                // to samo, najkrócej
    printf("licznik = %d\n", licznik);    // licznik = 3
}
