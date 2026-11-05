#include <stdio.h>

int main(void)
{
    int x = 7;
    int y = 2;

    // Oba składniki to int, więc każdy wynik też jest int
    printf("%d\n", x + y);    // 9
    printf("%d\n", x - y);    // 5
    printf("%d\n", x * y);    // 14
    printf("%d\n", x / y);    // 3, a nie 3.5!
    printf("%d\n", x % y);    // 1
}
