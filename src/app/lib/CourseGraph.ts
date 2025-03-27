export class CourseGraph {
    private graph: { [key: string]: string[] } = {};
    private inDegree: { [key: string]: number } = {};
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

    getAvailableCourses(completedCourses: string[], currentYear: number): string[] {
        const localInDegree = { ...this.inDegree };
        let queue = [...completedCourses];
        let available = new Map<string, number>();
        // Cache to store total dependency counts to avoid recomputing
        let dependencyCountCache: { [key: string]: number } = {};
         // Helper function: Recursively count total downstream dependencies
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
        // Process available courses
        while (queue.length > 0) {
            let course = queue.shift()!;
            if (this.graph[course]) {
                this.graph[course].forEach(nextCourse => {
                    localInDegree[nextCourse] -= 1;
                    if (localInDegree[nextCourse] === 0 && (this.yearRequirement[nextCourse] === null || this.yearRequirement[nextCourse] <= currentYear)) {
                        let priority = countDependencies(nextCourse);
                        available.set(nextCourse, priority);
                    }
                });
            }
        }
        // Sort available courses by their total impact (higher = more important)
        return Array.from(available.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([course]) => course);
    }
}

// Create a default instance if needed
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
courseGraph.addCourse("CSE 3213", ["CSE 4214"], 3); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"], 3); // Manage SW Project

// Semester 8
courseGraph.addCourse("CSE 3763", [], 3); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"], 3); // SE Senior Project 2

//Required Sciences
// Level 1 Science Courses
courseGraph.addCourse("PH 1113", []);
courseGraph.addCourse("CH 1213", []);
courseGraph.addCourse("BIO 1134", []);


// Level 2 Science Courses 
courseGraph.addCourse("PH 1123", ["PH 1113"]); // Requires 1113
courseGraph.addCourse("CH 1223", ["CH 1213"]); // Requires 1213
courseGraph.addCourse("BIO 1144", ["BIO 1134"]); // Requires 1134

// Example usage
//const completed = ["CSE 1284", "CSE 1384", "CSE 2383"];
//console.log("Available Courses:", courseGraph.getAvailableCourses(completed));
// Tech electives


