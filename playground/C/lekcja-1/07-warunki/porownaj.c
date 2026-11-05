#include <stdio.h>

int main(void)
{
    // int (od integer): dwie zmienne na liczby całkowite
    int x;
    int y;

    printf("Podaj x: ");
    // %d: wczytaj liczbę całkowitą, &x: adres, pod który ją zapisać
    scanf("%d", &x);
    printf("Podaj y: ");
    scanf("%d", &y);

    // Warunki sprawdzamy po kolei. Wykona się tylko jedna gałąź.
    if (x < y)
    {
        printf("x jest mniejsze od y\n");
    }
    else if (x > y)
    {
        printf("x jest większe od y\n");
    }
    else
    {
        // ani mniejsze, ani większe, czyli równe
        printf("x jest równe y\n");
    }
}
