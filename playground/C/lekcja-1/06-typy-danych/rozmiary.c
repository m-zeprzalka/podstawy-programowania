#include <stdio.h>

int main(void)
{
    // sizeof podaje rozmiar w bajtach, a %zu to wstawka na taki rozmiar
    printf("int: %zu B\n", sizeof(int));          // int: 4 B
    printf("double: %zu B\n", sizeof(double));    // double: 8 B
}
