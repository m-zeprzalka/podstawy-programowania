#include <stdio.h>
#include <string.h>

int main(void)
{
    // strlen liczy bajty, a %zu to wstawka na jej wynik
    printf("%zu\n", strlen("Zazolc"));    // 6
    printf("%zu\n", strlen("Zażółć"));    // 10
}
