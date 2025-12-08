export class CourseGraph {
    private graph: { [key: string]: string[] } = {};
    private inDegree: { [key: string]: number } = {};
    private courseARate: { [key: string]: number } = {}; 
    private yearRequirement: { [key: string]: number | null } = {};
    private semesterAvailability: { 
        [key: string]: "fall" | "spring" | "both" | "neither" 
    } = {};

    constructor() {}

    addCourse(
        course: string,
        prerequisites: string[],
        yearReq: number | null = null,
        semester: "fall" | "spring" | "both" | "neither" = "both"
    ): void {
        if (!this.graph[course]) this.graph[course] = [];
        if (!this.inDegree[course]) this.inDegree[course] = 0;

        this.yearRequirement[course] = yearReq;
        this.semesterAvailability[course] = semester; 

        prerequisites.forEach(pre => {
            if (!this.graph[pre]) this.graph[pre] = [];
            this.graph[pre].push(course);
            this.inDegree[course] = (this.inDegree[course] || 0) + 1;
        });
    }

    assignARate(course: string, percentage: number): void {
        if (this.graph[course] || this.inDegree[course] !== undefined) {
            this.courseARate[course] = percentage;
            console.log(`Assigned A rate of ${percentage}% to course ${course}`);
        } else {
            console.log(`Error: Course ${course} does not exist.`);
        }
    }

    getAvailableCourses(
        completedCourses: string[],
        currentYear: number,
        currentSemester: "fall" | "spring"
    ): { 
        course: string; 
        aRate: string; 
        semester: string; 
    }[] {

        const localInDegree = { ...this.inDegree };
        let queue = [...completedCourses];
        let available = new Map<string, number>();
        let dependencyCountCache: { [key: string]: number } = {};

        // Define science rules
        const firstLevelSciences = ["PH 1113", "CH 1213", "BIO 1134"];
        const secondLevelSciences = ["PH 1123", "CH 1223", "BIO 1144"];

        let firstLevelCompleted = firstLevelSciences.filter(c => completedCourses.includes(c)).length;
        let secondLevelCompleted = secondLevelSciences.some(c => completedCourses.includes(c));

        // Semester filter helper
        const isAvailableThisSemester = (course: string): boolean => {
            const sem = this.semesterAvailability[course];
            return (
                sem === "both" ||
                sem === currentSemester
            );
        };

        // If the student completed 2 first-level sciences, unlock 2nd-level sciences
        if (firstLevelCompleted >= 2 && !secondLevelCompleted) {
            secondLevelSciences
                .filter(course => !completedCourses.includes(course))
                .filter(course => isAvailableThisSemester(course)) // NEW
                .forEach(course => {
                    available.set(course, 1000 + (dependencyCountCache[course] || 0));
                });
        }

        // Dependency counting helper
        const countDependencies = (course: string): number => {
            if (dependencyCountCache[course] !== undefined) {
                return dependencyCountCache[course];
            }
            let count = 0;
            if (this.graph[course]) {
                for (const nextCourse of this.graph[course]) {
                    count += 1 + countDependencies(nextCourse);
                }
            }
            dependencyCountCache[course] = count;
            return count;
        };

        // Add no-prereq courses
        for (const course in this.inDegree) {
            if (
                this.inDegree[course] === 0 &&
                !completedCourses.includes(course) &&
                (this.yearRequirement[course] === null || this.yearRequirement[course] <= currentYear) &&
                isAvailableThisSemester(course) 
            ) {
                available.set(course, countDependencies(course));
            }
        }

        // BFS to unlock additional courses
        while (queue.length > 0) {
            let course = queue.shift()!;
            if (this.graph[course]) {
                this.graph[course].forEach(nextCourse => {
                    localInDegree[nextCourse] -= 1;
                    if (
                        localInDegree[nextCourse] === 0 &&
                        (this.yearRequirement[nextCourse] === null || this.yearRequirement[nextCourse] <= currentYear) &&
                        isAvailableThisSemester(nextCourse) 
                    ) {
                        available.set(nextCourse, countDependencies(nextCourse));
                    }
                });
            }
        }

        // Return sorted results
        return Array.from(available.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([course]) => ({
                course,
                semester: this.semesterAvailability[course], 
                aRate: this.courseARate[course] !== undefined
                    ? `${this.courseARate[course]}%`
                    : "Not available" //If A rate doesn't exist show NA instead of 0%
            }));
    }
}


// Create an instance
export const courseGraph = new CourseGraph();

// Default Courses
// Semester 1
courseGraph.addCourse("CSE 1284", [], null, "both"); // Intro to Computer Programming
courseGraph.addCourse("CSE 1011", [], null, "fall"); // Intro to CSE
courseGraph.assignARate("CSE 1011", 91);
courseGraph.assignARate("CSE 1284", 38);

// Semester 2 
courseGraph.addCourse("CSE 1384", ["CSE 1284"], null, "both"); // Intermediate Programming
courseGraph.addCourse("CSE 2813", ["CSE 1284"], null, "both"); // Discrete Structures
courseGraph.assignARate("CSE 1384", 35);
courseGraph.assignARate("CSE 2813", 72);

// Semester 3
courseGraph.addCourse("CSE 2383", ["CSE 1384"], null, "both"); // Data Structures
courseGraph.addCourse("CSE 2213", ["CSE 1384"], null, "both"); // Methods & Tools
courseGraph.assignARate("CSE 2383", 43);
courseGraph.assignARate("CSE 2213", 62);

// Semester 4
courseGraph.addCourse("CSE 3183", ["CSE 2383"], null, "both"); // Systems Programming
courseGraph.addCourse("CSE 3724", ["CSE 1384", "CSE 2383"], null, "both"); // Computer Organization
courseGraph.assignARate("CSE 3183", 48);
courseGraph.assignARate("CSE 3724", 81);

// Semester 5
courseGraph.addCourse("CSE 4733", ["CSE 3183", "CSE 3724"], null, "both"); // Operating Systems 1
courseGraph.addCourse("CSE 4214", ["CSE 2383"], null, "both"); // Intro to SE
courseGraph.assignARate("CSE 4733", 68);
courseGraph.assignARate("CSE 4214", 74);

// Semester 6
courseGraph.addCourse("CSE 4283", ["CSE 4214"], null, "spring"); // SW Test & QA
courseGraph.addCourse("CSE 4833", ["CSE 2383", "CSE 2813"], null, "both"); // Intro to Algorithms
courseGraph.assignARate("CSE 4283", 55);
courseGraph.assignARate("CSE 4833", 46);

// Semester 7
courseGraph.addCourse("CSE 4233", ["CSE 4214"], null, "fall"); // Software Arch & Design
courseGraph.addCourse("CSE 3213", ["CSE 4214"], 3, "fall"); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"], 3, "fall"); // Manage SW Project
courseGraph.assignARate("CSE 4233", 74);
courseGraph.assignARate("CSE 3213", 99);
courseGraph.assignARate("CSE 4223", 91);

// Semester 8
courseGraph.addCourse("CSE 3763", [], 3, "both"); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"], 3, "spring"); // SE Senior Project 2
courseGraph.assignARate("CSE 3763", 68);
courseGraph.assignARate("CSE 3223", 99);

//Required Sciences
// Level 1 Science Courses
courseGraph.addCourse("PH 1113", [], null, "both");
courseGraph.addCourse("CH 1213", [], null, "both");
courseGraph.addCourse("BIO 1134", [], null, "both");

// Level 2 Science Courses 
courseGraph.addCourse("PH 1123", ["PH 1113"], null, "both"); // Requires 1113
courseGraph.addCourse("CH 1223", ["CH 1213"], null, "both"); // Requires 1213
courseGraph.addCourse("BIO 1144", ["BIO 1134"], null, "both"); // Requires 1134
//Science A Rates
courseGraph.assignARate("PH 1113", 28);
courseGraph.assignARate("PH 1123", 29);
courseGraph.assignARate("CH 1213", 24);
courseGraph.assignARate("CH 1223", 25);
courseGraph.assignARate("BIO 1134", 27);
courseGraph.assignARate("BIO 1144", 17);

//English Composition 
courseGraph.addCourse("EN 1103", [], null, "both");
courseGraph.addCourse("EN 1113", [], null, "both");
courseGraph.assignARate("EN 1103", 35);
courseGraph.assignARate("EN 1113", 44);

//Tech Electives
courseGraph.addCourse("CSE 3324", ["CSE 2383", "CSE 4503"], null, "neither"); //Dist Client/Server Prog
courseGraph.assignARate("CSE 3324", 57);
courseGraph.addCourse("CSE 3683", ["CSE 1384"], null, "both"); //AI Fundamentals
courseGraph.addCourse("CSE 3713", ["CSE 1284"], null, "both"); //Introduction to Cybersecurity
courseGraph.assignARate("CSE 3713", 80);
courseGraph.addCourse("CSE 3813", ["CSE 2383", "CSE 2813"], null, "neither");  //Intro to Formal Lang
courseGraph.assignARate("CSE 3813", 28);
courseGraph.addCourse("CSE 4153", ["CSE 3724"], null, "both"); //Data Comm Networks
courseGraph.assignARate("CSE 4153", 61);
courseGraph.addCourse("CSE 4163", ["CSE 3183"], null, "spring"); //Des Parallel Alg
courseGraph.addCourse("CSE 4173", ["CSE 2383"], null, "spring"); //Cryptography
courseGraph.assignARate("CSE 4173", 27);
courseGraph.addCourse("CSE 4243", ["CSE 3183"], null, "fall"); //Info and Computer Sec
courseGraph.assignARate("CSE 4243", 93);
courseGraph.addCourse("CSE 4253", ["CSE 2383", "CSE 2213"], null, "fall"); //Secure Software Engineering
courseGraph.assignARate("CSE 4253", 54);
courseGraph.addCourse("CSE 4273", [], 4, "fall"); //Intro to Computer Forensics
courseGraph.assignARate("CSE 4273", 91);
courseGraph.addCourse("CSE 4293", ["CSE 4633"], null, "neither"); //AI for Cybersecurity
courseGraph.addCourse("CSE 4353", ["CSE 3724"], null, "neither"); //Literate Programming
courseGraph.addCourse("CSE 4363", ["CSE 3183"], null, "spring"); //Software Reverse Engineering
courseGraph.assignARate("CSE 4363", 51);
courseGraph.addCourse("CSE 4383", ["CSE 4173"], null, "spring"); //Network Security
courseGraph.assignARate("CSE 4383", 77);
courseGraph.addCourse("CSE 4413", ["CSE 2383"], null, "spring"); //Computer Graphics
courseGraph.assignARate("CSE 4413", 41);
courseGraph.addCourse("CSE 4423", [], null, "both"); //Data Visualization
courseGraph.assignARate("CSE 4423", 65);
courseGraph.addCourse("CSE 4433", [], null, "fall"); //VXR Dev
courseGraph.assignARate("CSE 4433", 74);
courseGraph.addCourse("CSE 4453", ["CSE 2213"], 3, "spring"); //Game Design
courseGraph.assignARate("CSE 4453", 46);
courseGraph.addCourse("CSE 4503", ["CSE 2383", "CSE 2813"], null, "both"); //Database Management Systems 
courseGraph.assignARate("CSE 4503", 76);
courseGraph.addCourse("CSE 4613", [], null, "neither"); //Bio Computing
courseGraph.assignARate("CSE 4613", 28);
courseGraph.addCourse("CSE 4633", ["CSE 2383", "CSE 2813"], null, "both"); //Artificial Intelligence
courseGraph.assignARate("CSE 4633", 76);
courseGraph.addCourse("CSE 4643", ["CSE 2383"], null, "fall"); //AI Robotics
courseGraph.assignARate("CSE 4643", 73);
courseGraph.addCourse("CSE 4653", ["CSE 4633"], null, "both"); //Cognitive Science
courseGraph.assignARate("CSE 4653", 29);
courseGraph.addCourse("CSE 4663", [], 3, "fall");  //Human Computer Interaction
courseGraph.assignARate("CSE 4663", 97);
courseGraph.addCourse("CSE 4683", ["IE 4613"], null, "fall"); //Machine Learning and Soft Comp. has other 1 off requirements, only 1 is needed
courseGraph.addCourse("CSE 4693", ["IE 4613"], null, "spring"); //Intro to Machine Learning
courseGraph.assignARate("CSE 4693", 54);
courseGraph.addCourse("CSE 4714", ["CSE 3723", "CSE 2383"], null, "both"); //Theory and Implementation of Prog Lang
courseGraph.assignARate("CSE 4714", 42);
courseGraph.addCourse("CSE 4743", ["CSE 4733"], null, "neither"); //Operating Systems II
courseGraph.addCourse("CSE 4773", [], null, "spring"); //Intro to Cyber Ops
courseGraph.assignARate("CSE 4773", 84);
courseGraph.addCourse("CSE 4783", ["CSE 2383"], null, "neither"); //Cloud Computing and Security
courseGraph.assignARate("CSE 4783", 84);
