#include <stdio.h>

int main(void)
{
    char imie[] = "Ola";     // napis
    char inicjal = 'O';      // jeden znak
    int wiek = 20;           // liczba całkowita
    double wzrost = 1.68;    // liczba z ułamkiem

    // Wstawki wypełniają się po kolei wartościami podanymi po przecinku
    printf("%s (%c), %d lat, %.2f m\n", imie, inicjal, wiek, wzrost);
}
