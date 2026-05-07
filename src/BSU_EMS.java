import java.util.*;     // Contains all java utility necessities. The ones I used include Scanner, HashMap, and HashSet, and TreeMap

public class BSU_EMS {            // Main class titled BSU_EMS.java
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);       // java.util.Scanner is used to unlock interaction via terminal

        HashMap<String, Event> events = new HashMap<>();    // A hashmap is used to pair an event with their details
        System.out.print("Welcome to the BSU Event Management System (BEMS)! " +
                "This assignment is for Dr. Olusegun's COSC 369 class, Software Engineering.\n" +
                "Pick an option below to get started.\n\n");
        System.out.println("1. Add events");
        System.out.println("2. View events");
        System.out.println("3. Edit or Delete Event");
        System.out.println("4. Exit\n");
        System.out.print("ENTER NUMBER HERE: ");        // Custom menu is printed. Choose a valid number.


        while (true) {      // Continuous loop until "break;" command is reached
            try {       // Try function used to check for invalid inputs
                int inputNum = scanner.nextInt();


                switch (inputNum) {     // Switch-Case-Break branching statement for valid inputs
                    case 1:
                        CaseOne.one(events);  break;      // Hashmap data gets copied into class CaseOne
                    case 2:
                        if (events.isEmpty()) {       // Must add data in hashmap to make class CaseTwo function
                            System.out.println("There are no events to view! " +
                                    "Type \"1\" to add an event.");
                        } else {
                            CaseTwo.two(events);      // Hashmap data gets copied into class CaseOne
                        }       break;
                    case 3:
                        if (events.isEmpty()) {       // Must add data in hashmap to make classThree function
                            System.out.println("There are no events to be edited nor deleted! " +
                                    "Type \"1\" to add an event.");
                        } else {
                            CaseThree.three(events);      // Hashmap data gets copied into class CaseThree
                        }       break;
                    case 4:
                        System.out.print("Goodbye!");   return;     // Code completely stops
                    default:
                        System.out.println("INVALID INPUT! Try again!");    break;      // Prints if a wrong integer is inputted
                }
            } catch (Exception e) {     // Catch function is applicable to any inputted string
                System.out.println("INVALID INPUT! Try again!");    scanner.next();
            }
        }
    }
}


class Event {
    public final String name;
    public final String date;
    public final String time;
    public final String location;
    public final String capacity;
    public final String description;
    public final Set<String> plan;
    public Event(String name, String date, String time, String location, String capacity, String description) {
        this.name = name;
        this.date = date;
        this.time = time;
        this.location = location;
        this.capacity = capacity;
        this.description = description;
        this.plan = new HashSet<>();
    } public Set<String> getPlans() {
        return plan;
    } public void addPlan(String plans) {
        plan.add(plans);
    }
}


class CaseOne {     // "1. Add events" leads you to here
    public static void one(HashMap<String, Event> events) {
        Scanner scanner = new Scanner(System.in);       // java.util.Scanner is used to unlock interaction via terminal

        System.out.print("Looks like you want to add an event(s)! Pick the type of event that you want to fill up!\n\n");
        System.out.println("1. Academic & Intellectual Event");
        System.out.println("2. Student Life & Social Interaction Event");
        System.out.println("3. Institutional & Administrative Event");
        System.out.println("4. Return to Previous Page (PEA)\n");
        System.out.print("ENTER NUMBER HERE: ");        // Custom menu is printed. Choose a valid number.


        while (true) {  // Continuous loop until "break;" command is reached
            try {       // Try function used to check for invalid inputs
                int inputNum2 = scanner.nextInt(); scanner.nextLine();

                switch (inputNum2) {        // Switch-Case-Break branching statement for valid inputs
                    case 1: {
                        System.out.print("\nHow many Academic events would you like to add?\n");
                        System.out.print("ENTER NUMBER HERE: ");
                        int count = scanner.nextInt(); scanner.nextLine(); // clear buffer

                        for (int i = 1; i <= count; i++) {
                            System.out.print("\nEnter Academic Event #" + i + "'s Name - ");
                            String name = scanner.nextLine();

                            System.out.print("Enter Academic Event #" + i + "'s Date - ");
                            String date = scanner.nextLine();

                            System.out.print("Enter Academic Event #" + i + "'s Time - ");
                            String time = scanner.nextLine();

                            System.out.print("Enter Academic Event #" + i + "'s Location - ");
                            String location = scanner.nextLine();

                            System.out.print("Enter Academic Event #" + i + "'s Capacity, the maximum number of attendees - ");
                            String capacity = scanner.nextLine();

                            System.out.print("Enter description & any additional information for Academic Event #" + i + " - ");
                            String description = scanner.nextLine();

                            events.putIfAbsent(name + "_" + date + "_" + time + "_" + i, new Event(name, date, time, location, capacity, description));
                            events.get(name + "_" + date + "_" + time + "_" + i).addPlan("Academic");
                        } System.out.println("\nAcademic event added.\nEnter 1 for Academic, 2 for Social, 3 for Administrative, 4 to go back: ");
                        break; }

                    case 2: {
                        System.out.print("\nHow many Social events would you like to add?\n");
                        System.out.print("ENTER NUMBER HERE: ");
                        int count = scanner.nextInt(); scanner.nextLine(); // clear buffer

                        for (int i = 1; i <= count; i++) {
                            System.out.print("\nEnter Social Event #" + i + "'s Name - ");
                            String name = scanner.nextLine();

                            System.out.print("Enter Social Event #" + i + "'s Date - ");
                            String date = scanner.nextLine();

                            System.out.print("Enter Social Event #" + i + "'s Time - ");
                            String time = scanner.nextLine();

                            System.out.print("Enter Social Event #" + i + "'s Location - ");
                            String location = scanner.nextLine();

                            System.out.print("Enter Social Event #" + i + "'s Capacity, the maximum number of attendees - ");
                            String capacity = scanner.nextLine();

                            System.out.print("Enter description & any additional information for Social Event #" + i + " - ");
                            String description = scanner.nextLine();

                            events.putIfAbsent(name + "_" + date + "_" + time + "_" + i, new Event(name, date, time, location, capacity, description));
                            events.get(name + "_" + date + "_" + time + "_" + i).addPlan("Social");
                        } System.out.println("\nSocial event added.\nEnter 1 for Academic, 2 for Social, 3 for Administrative, 4 to go back: ");
                        break; }


                    case 3: {
                        System.out.print("\nHow many Administrative events would you like to add?\n");
                        System.out.print("ENTER NUMBER HERE: ");
                        int count = scanner.nextInt(); scanner.nextLine(); // clear buffer

                        for (int i = 1; i <= count; i++) {
                            System.out.print("\nEnter Administrative Event #" + i + "'s Name - ");
                            String name = scanner.nextLine();

                            System.out.print("Enter Administrative Event #" + i + "'s Date - ");
                            String date = scanner.nextLine();

                            System.out.print("Enter Administrative Event #" + i + "'s Time - ");
                            String time = scanner.nextLine();

                            System.out.print("Enter Administrative Event #" + i + "'s Location - ");
                            String location = scanner.nextLine();

                            System.out.print("Enter Administrative Event #" + i + "'s Capacity, the maximum number of attendees - ");
                            String capacity = scanner.nextLine();

                            System.out.print("Enter description & any additional information for Administrative Event #" + i + " - ");
                            String description = scanner.nextLine();

                            events.putIfAbsent(name + "_" + date + "_" + time + "_" + i, new Event(name, date, time, location, capacity, description));
                            events.get(name + "_" + date + "_" + time + "_" + i).addPlan("Administrative");
                        } System.out.println("\nAdministrative event added.\nEnter 1 for Academic, 2 for Social, 3 for Administrative, 4 to go back: ");
                        break; }

                    case 4:
                        System.out.println("\nReturning to Event Management Menu.");
                        System.out.println("1. Add events");
                        System.out.println("2. View events");
                        System.out.println("3. Edit or Delete Event");
                        System.out.println("4. Exit\n");
                        System.out.print("ENTER NUMBER HERE: ");    return;     // Prints the PEA menu
                    default:
                        System.out.println("INVALID INPUT! Try again!");    break;      // Prints if a wrong integer is inputted
                }
            } catch (Exception e) {     // Catch function is applicable to any inputted string. Returns to Add Event menu
                System.out.println("INVALID INPUT! Try again!\n");
                System.out.println("1. Academic & Intellectual Event");
                System.out.println("2. Student Life & Social Interaction Event");
                System.out.println("3. Institutional & Administrative Event");
                System.out.println("4. Return to Previous Page (PEA)\n");
                System.out.print("ENTER NUMBER HERE: ");    scanner.nextLine();
            }
        }
    }
}


class CaseTwo {     // "2. View Events" leads you to here
    public static void two(HashMap<String, Event> events) {
        Scanner scanner = new Scanner(System.in);   int i;

        System.out.println("\n--------- ACADEMIC EVENTS ---------");
        i = 1;
        for (Event e : events.values()) {
            if (e.getPlans().contains("Academic")) {
                System.out.println("Event #" + i++);
                System.out.println("Name: " + e.name);
                System.out.println("Date: " + e.date);
                System.out.println("Time: " + e.time);
                System.out.println("Location: " + e.location);
                System.out.println("Capacity: " + e.capacity);
                System.out.println("Description: " + e.description + "\n");
            }
        }

        System.out.println("\n--------- SOCIAL EVENTS ---------");
        i = 1;
        for (Event e : events.values()) {
            if (e.getPlans().contains("Social")) {
                System.out.println("Event #" + i++);
                System.out.println("Name: " + e.name);
                System.out.println("Date: " + e.date);
                System.out.println("Time: " + e.time);
                System.out.println("Location: " + e.location);
                System.out.println("Capacity: " + e.capacity);
                System.out.println("Description: " + e.description + "\n");
            }
        }

        System.out.println("\n--------- ADMINISTRATIVE EVENTS ---------");
        i = 1;
        for (Event e : events.values()) {
            if (e.getPlans().contains("Administrative")) {
                System.out.println("Event #" + i++);
                System.out.println("Name: " + e.name);
                System.out.println("Date: " + e.date);
                System.out.println("Time: " + e.time);
                System.out.println("Location: " + e.location);
                System.out.println("Capacity: " + e.capacity);
                System.out.println("Description: " + e.description + "\n");
            }
        }

        System.out.print("\nView the data above! Enter \"4\" to go back: ");
        while (true) {  // Continuous loop until "break;" command is reached
            try {       // Try function used to check for invalid inputs
                int inputNum3 = scanner.nextInt();

                switch (inputNum3) {        // Switch-Case-Break branching statement for valid inputs
                    case 4:
                        System.out.println("\nReturning to Predicate Evaluation Menu.");
                        System.out.println("1. Add events");
                        System.out.println("2. View events");
                        System.out.println("3. Edit or Delete Event");
                        System.out.println("4. Exit\n");
                        System.out.print("ENTER NUMBER HERE: ");    return;     // Prints the previous screen/menu
                    default:
                        System.out.println("INVALID INPUT! Try again!");    break;      // Prints if a wrong integer is inputted
                }
            } catch (Exception e) {     // Catch function is applicable to any inputted string
                System.out.println("INVALID INPUT! Try again!");
                scanner.next();
            }
        }
    }
}


class CaseThree {       // "3. Edit or Delete Event" leads you to here
    public static void three(HashMap<String, Event> events) {
        Scanner scanner = new Scanner(System.in);       // java.util.Scanner is used to unlock interaction via terminal

        System.out.println("\nView the data above! Enter \"4\" to go back: ");
        while (true) {  // Continuous loop until "break;" command is reached
            try {       // Try function used to check for invalid inputs
                int inputNum4 = scanner.nextInt();


                switch (inputNum4) {        // Switch-Case-Break branching statement for valid inputs
                    case 4:
                        System.out.println("\nReturning to Predicate Evaluation Menu.");
                        System.out.println("1. Add events");
                        System.out.println("2. View events");
                        System.out.println("3. Edit or Delete Event");
                        System.out.println("4. Exit\n");
                        System.out.print("ENTER NUMBER HERE: ");    return;     // Prints the previous screen/menu
                    default:
                        System.out.println("INVALID INPUT! Try again!");    break;      // Prints if a wrong integer is inputted
                }
            } catch (Exception e) {     // Catch function is applicable to any inputted string
                System.out.println("INVALID INPUT! Try again!");
                scanner.next();
            }
        }
    }
}