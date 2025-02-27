export class CourseGraph {
    private graph: { [key: string]: string[] } = {};
    private inDegree: { [key: string]: number } = {};
    private courseARate: { [key: string]: number } = {}; // Stores A rate percentages

    constructor() {}

    addCourse(course: string, prerequisites: string[]): void {
        if (!this.graph[course]) this.graph[course] = [];
        if (!this.inDegree[course]) this.inDegree[course] = 0;

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

    getAvailableCourses(completedCourses: string[]): { course: string; aRate: string }[] {
        const localInDegree = { ...this.inDegree };
        let queue = [...completedCourses];
        let available = new Set<string>();

        while (queue.length > 0) {
            let course = queue.shift()!;
            if (this.graph[course]) {
                this.graph[course].forEach(nextCourse => {
                    localInDegree[nextCourse] -= 1;
                    if (localInDegree[nextCourse] === 0) {
                        available.add(nextCourse);
                    }
                });
            }
        }

        return [...available].map(course => ({
            course,
            aRate: `${this.courseARate[course] || 0}%` // Return A rate or "0%" if not set
        }));
    }
}

// Create an instance
export const courseGraph = new CourseGraph();

// Default Courses
// Semester 1
courseGraph.addCourse("CSE 1284", []); // Intro to Computer Programming
courseGraph.addCourse("CSE 1011", []); // Intro to CSE

// Semester 2 
courseGraph.addCourse("CSE 1384", ["CSE 1284"]); // Intermediate Programming
courseGraph.addCourse("CSE 2813", ["CSE 1284"]); // Discrete Structures

// Semester 3
courseGraph.addCourse("CSE 2383", ["CSE 1384"]); // Data Structures
courseGraph.addCourse("CSE 2213", ["CSE 1384"]); // Methods & Tools

// Semester 4
courseGraph.addCourse("CSE 3183", ["CSE 2383"]); // Systems Programming
courseGraph.addCourse("CSE 3724", ["CSE 1384", "CSE 2383"]); // Computer Organization

// Semester 5
courseGraph.addCourse("CSE 4733", ["CSE 3183", "CSE 3724"]); // Operating Systems 1
courseGraph.addCourse("CSE 4214", ["CSE 2383"]); // Intro to SE

// Semester 6
courseGraph.addCourse("CSE 4283", ["CSE 4214"]); // SW Test & QA
courseGraph.addCourse("CSE 4833", ["CSE 2383", "CSE 2813"]); // Intro to Algorithms

// Semester 7
courseGraph.addCourse("CSE 4233", ["CSE 4214"]); // Software Arch & Design
courseGraph.addCourse("CSE 3213", ["CSE 4214"]); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"]); // Manage SW Project

// Semester 8
courseGraph.addCourse("CSE 3763", []); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"]); // SE Senior Project 2

//Required Sciences
// Level 1 Science Courses
courseGraph.addCourse("1113", []);
courseGraph.addCourse("1213", []);
courseGraph.addCourse("1134", []);

// Level 2 Science Courses 
courseGraph.addCourse("1123", ["1113"]); // Requires 1113
courseGraph.addCourse("1223", ["1213"]); // Requires 1213
courseGraph.addCourse("1144", ["1134"]); // Requires 1134
//Science A Rates
courseGraph.assignARate("1113", 28);
courseGraph.assignARate("1123", 29);
courseGraph.assignARate("1213", 24);
courseGraph.assignARate("1223", 25);
courseGraph.assignARate("1134", 27);
courseGraph.assignARate("1144", 17);

// Example usage
//const completed = ["CSE 1284", "CSE 1384", "CSE 2383"];
//console.log("Available Courses:", courseGraph.getAvailableCourses(completed));
// Tech electives
