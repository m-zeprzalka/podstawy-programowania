#include <stdio.h>

int main(void)
{
    // Litera po % mówi, jakiego rodzaju wartość wstawić
    printf("%d\n", 42);          // liczba całkowita: 42
    printf("%f\n", 3.5);         // liczba z ułamkiem: 3.500000
    printf("%.2f\n", 3.5);       // dwie cyfry po kropce: 3.50
    printf("%c\n", 'A');         // jeden znak: A
    printf("%s\n", "Ola");       // napis: Ola
    printf("100%%\n");           // sam znak procentu: 100%

    // Kilka wstawek: wartości po przecinku, w tej samej kolejności
    printf("%s ma %d lat\n", "Ola", 20);

    // Znaki specjalne z ukośnikiem
    printf("imię:\tOla\n");      // \t to tabulator
    printf("Powiedział \"hej\"\n");
}
