#include <stdio.h>

int main(void)
{
    // Puste [] znaczą: kompilatorze, policz miejsca sam.
    // "Ola" to 3 litery i znak końca \0, czyli 4 miejsca.
    char imie[] = "Ola";

    // %s to pole w szablonie, a imie to dane, które w nie trafią
    printf("Cześć, %s!\n", imie);
}
