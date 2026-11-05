#include <stdio.h>

// Prototyp: zapowiedź funkcji, która jest niżej. Na końcu średnik.
void miau(int n);

int main(void)
{
    miau(3);              // wywołanie: n dostanie 3
    printf("Koniec!\n");
}

// Definicja: void, bo nic nie oddaje, i int n, bo dostaje liczbę
void miau(int n)
{
    for (int i = 0; i < n; i++)
    {
        printf("miau\n");
    }
}
