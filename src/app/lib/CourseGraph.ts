export class CourseGraph {
    private graph: { [key: string]: string[] } = {};
    private inDegree: { [key: string]: number } = {};
    private courseARate: { [key: string]: number } = {}; // Stores A rate percentages
    private yearRequirement: { [key: string]: number | null } = {};

    constructor() {}

    addCourse(course: string, prerequisites: string[], yearReq: number | null = null): void {
        if (!this.graph[course]) this.graph[course] = [];
        if (!this.inDegree[course]) this.inDegree[course] = 0;
        this.yearRequirement[course] = yearReq;

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

    getAvailableCourses(completedCourses: string[], currentYear: number): { course: string; aRate: string }[] {
        const localInDegree = { ...this.inDegree };
        let queue = [...completedCourses];
        let available = new Map<string, number>();
        let dependencyCountCache: { [key: string]: number } = {};

        // 🔹 Define first & second-level science courses
        const firstLevelSciences = ["PH 1113", "CH 1213", "BIO 1134"];
        const secondLevelSciences = ["PH 1123", "CH 1223", "BIO 1144"];

        let firstLevelCompleted = firstLevelSciences.filter(course => completedCourses.includes(course)).length;
        let secondLevelCompleted = secondLevelSciences.some(course => completedCourses.includes(course));

        // 🔹 If 2 Level 1 sciences are done, enforce Level 2 selection first
        if (firstLevelCompleted >= 2 && !secondLevelCompleted) {
            return secondLevelSciences
                .filter(course => !completedCourses.includes(course))
                .map(course => ({ course, aRate: `${this.courseARate[course] || 0}%` }));
        }

        // 🔹 Helper function to count total dependencies
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

        // 🔹 Add all courses with no prerequisites & available Level 1 sciences
        for (const course in this.inDegree) {
            if (this.inDegree[course] === 0 && !completedCourses.includes(course)) {
                if (this.yearRequirement[course] === null || this.yearRequirement[course] <= currentYear) {
                    available.set(course, countDependencies(course));
                }
            }
        }

        // 🔹 Process remaining available courses
        while (queue.length > 0) {
            let course = queue.shift()!;
            if (this.graph[course]) {
                this.graph[course].forEach(nextCourse => {
                    localInDegree[nextCourse] -= 1;
                    if (localInDegree[nextCourse] === 0 && (this.yearRequirement[nextCourse] === null || this.yearRequirement[nextCourse] <= currentYear)) {
                        available.set(nextCourse, countDependencies(nextCourse));
                    }
                });
            }
        }

        // 🔹 Return sorted available courses with A rates
        return Array.from(available.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by impact (higher = more important)
            .map(([course]) => ({
                course,
                aRate: `${this.courseARate[course] || 0}%`
            }));
    }
}

// Create an instance
export const courseGraph = new CourseGraph();

// Default Courses
// Semester 1
courseGraph.addCourse("CSE 1284", []); // Intro to Computer Programming
courseGraph.addCourse("CSE 1011", []); // Intro to CSE
courseGraph.assignARate("CSE 1011", 91);
courseGraph.assignARate("CSE 1284", 38);

// Semester 2 
courseGraph.addCourse("CSE 1384", ["CSE 1284"]); // Intermediate Programming
courseGraph.addCourse("CSE 2813", ["CSE 1284"]); // Discrete Structures
courseGraph.assignARate("CSE 1384", 35);
courseGraph.assignARate("CSE 2813", 72);

// Semester 3
courseGraph.addCourse("CSE 2383", ["CSE 1384"]); // Data Structures
courseGraph.addCourse("CSE 2213", ["CSE 1384"]); // Methods & Tools
courseGraph.assignARate("CSE 2383", 43);
courseGraph.assignARate("CSE 2213", 62);

// Semester 4
courseGraph.addCourse("CSE 3183", ["CSE 2383"]); // Systems Programming
courseGraph.addCourse("CSE 3724", ["CSE 1384", "CSE 2383"]); // Computer Organization
courseGraph.assignARate("CSE 3183", 48);
courseGraph.assignARate("CSE 3724", 81);

// Semester 5
courseGraph.addCourse("CSE 4733", ["CSE 3183", "CSE 3724"]); // Operating Systems 1
courseGraph.addCourse("CSE 4214", ["CSE 2383"]); // Intro to SE
courseGraph.assignARate("CSE 4733", 68);
courseGraph.assignARate("CSE 4214", 74);

// Semester 6
courseGraph.addCourse("CSE 4283", ["CSE 4214"]); // SW Test & QA
courseGraph.addCourse("CSE 4833", ["CSE 2383", "CSE 2813"]); // Intro to Algorithms
courseGraph.assignARate("CSE 4283", 55);
courseGraph.assignARate("CSE 4833", 46);

// Semester 7
courseGraph.addCourse("CSE 4233", ["CSE 4214"]); // Software Arch & Design
courseGraph.addCourse("CSE 3213", ["CSE 4214"], 3); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"], 3); // Manage SW Project
courseGraph.assignARate("CSE 4233", 74);
courseGraph.assignARate("CSE 3213", 99);
courseGraph.assignARate("CSE 4223", 91);

// Semester 8
courseGraph.addCourse("CSE 3763", [], 3); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"], 3); // SE Senior Project 2
courseGraph.assignARate("CSE 3763", 68);
courseGraph.assignARate("CSE 3223", 99);

//Required Sciences
// Level 1 Science Courses
courseGraph.addCourse("PH 1113", []);
courseGraph.addCourse("CH 1213", []);
courseGraph.addCourse("BIO 1134", []);

// Level 2 Science Courses 
courseGraph.addCourse("PH 1123", ["PH 1113"]); // Requires 1113
courseGraph.addCourse("CH 1223", ["CH 1213"]); // Requires 1213
courseGraph.addCourse("BIO 1144", ["BIO 1134"]); // Requires 1134
//Science A Rates
courseGraph.assignARate("PH 1113", 28);
courseGraph.assignARate("PH 1123", 29);
courseGraph.assignARate("CH 1213", 24);
courseGraph.assignARate("CH 1223", 25);
courseGraph.assignARate("BIO 1134", 27);
courseGraph.assignARate("BIO 1144", 17);

//English Composition 
courseGraph.addCourse("EN 1103", []);
courseGraph.addCourse("EN 1113", []);
courseGraph.assignARate("EN 1103", 35);
courseGraph.assignARate("EN 1113", 44);

//Tech Electives
courseGraph.addCourse("CSE 3713", ["CSE 1284"]);
courseGraph.assignARate("CSE 3713", 80);
courseGraph.addCourse("CSE 4153", ["CSE 3724"]);
courseGraph.assignARate("CSE 4153", 61);
courseGraph.addCourse("CSE 4163", ["CSE 3183"]);
courseGraph.addCourse("CSE 4173", ["CSE 2383"]);
courseGraph.assignARate("CSE 4173", 27);
courseGraph.addCourse("CSE 4273", [], 4); //Requires senior standing, unsure how to implement
courseGraph.assignARate("CSE 4273", 91);
courseGraph.addCourse("CSE 4293", ["CSE 4633"]);
courseGraph.addCourse("CSE 4353", ["CSE 3724"]);
courseGraph.addCourse("CSE 4363", ["CSE 3183"]);
courseGraph.assignARate("CSE 4363", 51);
courseGraph.addCourse("CSE 4383", ["CSE 4173"]);
courseGraph.assignARate("CSE 4383", 77);
courseGraph.addCourse("CSE 4413", ["CSE 2383"]);
courseGraph.assignARate("CSE 4413", 41);
courseGraph.addCourse("CSE 4423", []);
courseGraph.addCourse("CSE 4433", []);
courseGraph.assignARate("CSE 4433", 74);
courseGraph.addCourse("CSE 4453", ["CSE 2213"], 3);
courseGraph.assignARate("CSE 4453", 46);
courseGraph.addCourse("CSE 4503", ["CSE 2383"]);
courseGraph.assignARate("CSE 4503", 76);
courseGraph.addCourse("CSE 4633", ["CSE 2383"]);
courseGraph.assignARate("CSE 4633", 76);
courseGraph.addCourse("CSE 4643", ["CSE 2383"]);
courseGraph.assignARate("CSE 4643", 73);
courseGraph.addCourse("CSE 4653", ["CSE 4633"]);
courseGraph.assignARate("CSE 4653", 29);
courseGraph.addCourse("CSE 4663", [], 3); //Requires junior standing
courseGraph.assignARate("CSE 4663", 97);
courseGraph.addCourse("CSE 4683", ["IE 4613"]); //has other 1 off requirements, only 1 is needed
courseGraph.addCourse("CSE 4693", ["IE 4613"]);
courseGraph.assignARate("CSE 4693", 54);
courseGraph.addCourse("CSE 4714", ["CSE 3723"]);
courseGraph.assignARate("CSE 4714", 42);
courseGraph.addCourse("CSE 4743", ["CSE 4733"]);
courseGraph.addCourse("CSE 4773", []);
courseGraph.assignARate("CSE 4773", 84);
courseGraph.addCourse("CSE 4783", ["CSE 2383"]);
courseGraph.assignARate("CSE 4783", 84);
