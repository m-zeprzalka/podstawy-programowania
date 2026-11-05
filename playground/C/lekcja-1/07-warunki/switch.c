#include <stdio.h>

int main(void)
{
    char odpowiedz;
    printf("Zgadzasz się? (t/n) ");
    scanf(" %c", &odpowiedz);

    // switch porównuje jedną zmienną z kolejnymi wartościami
    switch (odpowiedz)
    {
        case 't':
        case 'T':
            printf("Zgoda.\n");
            break;    // koniec tego przypadku
        case 'n':
        case 'N':
            printf("Brak zgody.\n");
            break;
        default:      // wszystko inne
            printf("Nie rozumiem.\n");
    }
}
