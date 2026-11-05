#include <stdio.h>

int main(void)
{
    char litera = 'A';
    // %c wypisze znak, %d jego kod, a litera + 1 to następny kod
    printf("%c %d %c\n", litera, litera, litera + 1);    // A 65 B
}
