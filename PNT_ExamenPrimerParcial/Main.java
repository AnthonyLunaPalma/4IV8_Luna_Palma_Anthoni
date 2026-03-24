package PNT_ExamenPrimerParcial;
import java.util.Scanner;
public class Main{
    static String nombre;
    static String mat;
    static String pat;
    static String nacimiento;
    public static void main (String []args){
        Scanner sc = new Scanner(System.in);
        int opcion = 1;
        do {
            System.out.println("Menu");
            System.out.println("1) Ingresar nombre");
            System.out.println("2) Calculo de volumenes");
            System.out.println("3) Mostrar nombre y fecha de nacimiento y salir del sistema.");
            System.out.println("");
            System.out.println("Ingrese una opcion");
            System.out.println("");
            opcion = sc.nextInt();
            switch (opcion) {
                case 1:
                    System.out.println("Ingrese su nombre: ");
                    nombre = sc.next();
                    System.out.println("Ingrese su apellido materno: ");
                    mat = sc.next();
                    System.out.println("Ingrese so apellido paterno: ");
                    pat = sc.next();
                    System.out.println("Ingrese su fecha de nacimiento en el formato dia/mes/año sin espacios: ");
                    nacimiento = sc.next();
                break;
                case 2:
                    System.out.println("Calculo del volumen de las figuras:");
                    System.out.println("Piramide cuadrangular:");
                    System.out.println("");
                    System.out.println("Ingrese la medida de un lado de la base cuadrangular:");
                    double lado = sc.nextInt();
                    System.out.println("Ingrese la altura de la piramide:");
                    double altura = sc.nextInt();
                    double volumenPiramide = ((lado * lado) * altura) / 3;
                    System.out.println("");
                    System.out.println("Cono");
                    System.out.println("");
                    System.out.println("Ingrese el radio de la base del cono:");
                    double radio = sc.nextInt();
                    System.out.println("Ingrese la altura del cono");
                    double alturaCono = sc.nextInt();
                    double volumenCono = (((3.1415) * (radio * radio)) * alturaCono) / 3;
                    System.out.println("");
                    System.out.println("El volumen de la piramide cuadrangular es:" + volumenPiramide + " unidades cubicas.");
                    System.out.println("El volumen del cono es: " + volumenCono + " unidades cubicas");
                break;
                case 3:
                    System.out.println("Nombre: " + nombre + " " + mat + " " + pat);
                    System.out.println("Fecha de nacimikento: " + nacimiento);
                    System.out.println("Saliendo del sistema...");
                break;
                default:
                    System.out.println("Opcion invalida");
                break;
            }
        } while(opcion != 3);
    }
}