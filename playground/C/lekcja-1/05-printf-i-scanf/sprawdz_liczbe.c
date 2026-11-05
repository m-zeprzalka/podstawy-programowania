#include <stdio.h>

int main(void)
{
    int wiek = 0;
    printf("Ile masz lat? ");

    // scanf zwraca, ile wartości wczytał. Tu czekamy na jedną liczbę.
    if (scanf("%d", &wiek) != 1)
    {
        printf("To nie jest liczba.\n");
        return 1;    // kod wyjścia 1: błąd
    }

    printf("Za rok będziesz mieć %d lat.\n", wiek + 1);
}
