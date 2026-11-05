#include <stdio.h>

// int przed nazwą: funkcja oddaje liczbę całkowitą
int kwadrat(int x)
{
    return x * x;    // zakończ funkcję i oddaj x * x
}

int main(void)
{
    int wynik = kwadrat(5);    // kwadrat(5) zamienia się na 25
    printf("%d\n", wynik);     // 25

    // Wywołanie można wstawić wszędzie tam, gdzie pasuje liczba
    printf("%d\n", kwadrat(2) + kwadrat(3));    // 4 + 9 = 13
}
