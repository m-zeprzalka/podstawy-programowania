#include <stdio.h>

int main(void)
{
    double x = 0;
    printf("Podaj liczbę: ");

    // %lf: wczytaj double. Wpisz 3,5, a potem 3.5 i porównaj wynik.
    scanf("%lf", &x);
    printf("Wczytano: %f\n", x);
}
