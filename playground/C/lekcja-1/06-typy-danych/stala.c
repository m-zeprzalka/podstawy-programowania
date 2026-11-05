#include <stdio.h>

int main(void)
{
    // const: wartość nadana raz, przy tworzeniu. Nazwa wielkimi literami.
    const int DNI_W_TYGODNIU = 7;
    int liczba_tygodni = 4;

    printf("%d tygodnie to %d dni\n", liczba_tygodni, liczba_tygodni * DNI_W_TYGODNIU);

    // Odkomentuj linijkę niżej i skompiluj: dostaniesz błąd
    // assignment of read-only variable ‘DNI_W_TYGODNIU’
    // DNI_W_TYGODNIU = 8;
}
