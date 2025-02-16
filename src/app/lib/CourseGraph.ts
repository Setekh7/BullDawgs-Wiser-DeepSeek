export class CourseGraph {
    private graph: { [key: string]: string[] } = {};
    private inDegree: { [key: string]: number } = {};

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

    getAvailableCourses(completedCourses: string[]): string[] {
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
                    if (localInDegree[nextCourse] === 0) {
                        let priority = countDependencies(nextCourse); // Compute full impact
                        available.set(nextCourse, priority);
                    }
                });
            }
        }
    
        // Sort available courses by their total impact (higher = more important)
        return Array.from(available.entries())
            .sort((a, b) => b[1] - a[1]) // Sort in descending order of impact
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
courseGraph.addCourse("CSE 3213", ["CSE 4214"]); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"]); // Manage SW Project

// Semester 8
courseGraph.addCourse("CSE 3763", []); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"]); // SE Senior Project 2

// Example usage
//const completed = ["CSE 1284", "CSE 1384", "CSE 2383"];
//console.log("Available Courses:", courseGraph.getAvailableCourses(completed));
// Tech electives
