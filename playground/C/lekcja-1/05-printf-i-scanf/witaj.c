#include <stdio.h>

int main(void)
{
    // Zmienna na napis: 50 znaków w rzędzie
    char imie[50];

    // Pytanie bez \n, żeby odpowiedź była w tej samej linijce
    printf("Jak masz na imię? ");

    // %s: wczytaj napis do zmiennej imie (bez &)
    scanf("%s", imie);

    // W miejsce %s printf wstawi zawartość zmiennej imie
    printf("Cześć, %s!\n", imie);
}
