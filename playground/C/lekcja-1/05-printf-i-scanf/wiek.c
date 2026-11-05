#include <stdio.h>

int main(void)
{
    // int (od integer): zmienna na liczbę całkowitą
    int wiek;
    printf("Ile masz lat? ");

    // %d: wczytaj liczbę całkowitą
    // &wiek: adres zmiennej, czyli gdzie scanf ma zapisać liczbę
    scanf("%d", &wiek);

    // W miejsce %d trafi wynik działania wiek + 1
    printf("Za rok będziesz mieć %d lat.\n", wiek + 1);
}
