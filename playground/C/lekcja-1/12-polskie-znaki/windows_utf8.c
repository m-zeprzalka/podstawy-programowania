// Ten program skompiluje się tylko na Windowsie:
// plik windows.h istnieje tylko tam.
#include <stdio.h>
#include <windows.h>

int main(void)
{
    SetConsoleOutputCP(CP_UTF8);    // przełącz terminal na UTF-8
    printf("Zażółć gęślą jaźń\n");
}
