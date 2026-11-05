#include <stdio.h>

int main(void)
{
    int licznik = 0;       // ile razy już miauczał kot, na start 0
    while (licznik < 3)    // dopóki licznik jest mniejszy od 3
    {
        printf("miau\n");
        licznik++;         // licznik = licznik + 1
    }
    printf("Koniec!\n");
}
