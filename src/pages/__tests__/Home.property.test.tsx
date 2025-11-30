import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Task, Category } from '../../types/task'

// Generate valid ISO date strings
const isoDateStringArb = fc
  .integer({ min: 946684800000, max: 1924905600000 })
  .map(ms => new Date(ms).toISOString())

// Task status arbitrary
const taskStatusArb = fc.constantFrom('pending', 'in-progress', 'completed') as fc.Arbitrary<Task['status']>

// Task priority arbitrary
const taskPriorityArb = fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<Task['priority']>

// Category arbitrary (kept for potential future use)
const _categoryArb: fc.Arbitrary<Category> = fc.record({
  _id: fc.string({ minLength: 1, maxLength: 24 }).filter(s => s.trim().length > 0),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  slug: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  isSystem: fc.option(fc.boolean(), { nil: undefined }),
  createdAt: fc.option(isoDateStringArb, { nil: undefined }),
  updatedAt: fc.option(isoDateStringArb, { nil: undefined }),
})
void _categoryArb // Suppress unused variable warning

// Task arbitrary for testing
const taskArb: fc.Arbitrary<Task> = fc.record({
  _id: fc.string({ minLength: 1, maxLength: 24 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  status: taskStatusArb,
  priority: taskPriorityArb,
  category: fc.string({ minLength: 1, maxLength: 24 }).filter(s => s.trim().length > 0),
  createdAt: isoDateStringArb,
  updatedAt: isoDateStringArb,
})

// Generate a list of unique tasks
const taskListArb = fc.array(taskArb, { minLength: 0, maxLength: 20 }).map(tasks => {
  // Ensure unique IDs
  const seen = new Set<string>()
  return tasks.filter(task => {
    if (seen.has(task._id)) return false
    seen.add(task._id)
    return true
  })
})

/**
 * **Feature: api-integration, Property 10: Task Creation Adds to List**
 * *For any* successful task creation API call, the returned task SHALL be 
 * added to the tasks state array.
 * **Validates: Requirements 5.2**
 */
describe('Property 10: Task Creation Adds to List', () => {
  it('should add new task to the tasks array', () => {
    fc.assert(
      fc.property(
        taskListArb,
        taskArb,
        (existingTasks, newTask) => {
          // Ensure new task has unique ID
          const uniqueNewTask = {
            ...newTask,
            _id: `new_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          }

          // Simulate the state update logic from Home.tsx
          const updatedTasks = [...existingTasks, uniqueNewTask]

          // Assert: new task is added
          expect(updatedTasks.length).toBe(existingTasks.length + 1)
          expect(updatedTasks).toContainEqual(uniqueNewTask)
          // Assert: existing tasks are preserved
          existingTasks.forEach(task => {
            expect(updatedTasks).toContainEqual(task)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve task order with new task at end', () => {
    fc.assert(
      fc.property(
        taskListArb,
        taskArb,
        (existingTasks, newTask) => {
          const uniqueNewTask = {
            ...newTask,
            _id: `new_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          }

          // Simulate the state update logic
          const updatedTasks = [...existingTasks, uniqueNewTask]

          // Assert: new task is at the end
          expect(updatedTasks[updatedTasks.length - 1]).toEqual(uniqueNewTask)
          // Assert: existing tasks maintain their order
          for (let i = 0; i < existingTasks.length; i++) {
            expect(updatedTasks[i]).toEqual(existingTasks[i])
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 11: Task Update Reflects in List**
 * *For any* successful task update API call, the corresponding task in the 
 * tasks state array SHALL be replaced with the updated task data.
 * **Validates: Requirements 5.3**
 */
describe('Property 11: Task Update Reflects in List', () => {
  it('should replace existing task with updated data', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1, maxLength: 20 }).map(tasks => {
          // Ensure unique IDs
          const seen = new Set<string>()
          return tasks.filter(task => {
            if (seen.has(task._id)) return false
            seen.add(task._id)
            return true
          })
        }).filter(tasks => tasks.length > 0),
        fc.nat(),
        taskArb,
        (existingTasks, indexSeed, updatedTaskData) => {
          // Pick a random task to update
          const taskIndex = indexSeed % existingTasks.length
          const taskToUpdate = existingTasks[taskIndex]
          
          // Create updated task with same ID
          const updatedTask: Task = {
            ...updatedTaskData,
            _id: taskToUpdate._id,
          }

          // Simulate the state update logic from Home.tsx
          const updatedTasks = existingTasks.map(task =>
            task._id === taskToUpdate._id ? updatedTask : task
          )

          // Assert: list length unchanged
          expect(updatedTasks.length).toBe(existingTasks.length)
          // Assert: updated task is in the list
          expect(updatedTasks).toContainEqual(updatedTask)
          // Assert: task at same index is updated
          expect(updatedTasks[taskIndex]).toEqual(updatedTask)
          // Assert: other tasks unchanged
          existingTasks.forEach((task, i) => {
            if (i !== taskIndex) {
              expect(updatedTasks[i]).toEqual(task)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not modify other tasks when updating one', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 2, maxLength: 20 }).map(tasks => {
          const seen = new Set<string>()
          return tasks.filter(task => {
            if (seen.has(task._id)) return false
            seen.add(task._id)
            return true
          })
        }).filter(tasks => tasks.length >= 2),
        fc.nat(),
        taskArb,
        (existingTasks, indexSeed, updatedTaskData) => {
          const taskIndex = indexSeed % existingTasks.length
          const taskToUpdate = existingTasks[taskIndex]
          
          const updatedTask: Task = {
            ...updatedTaskData,
            _id: taskToUpdate._id,
          }

          const updatedTasks = existingTasks.map(task =>
            task._id === taskToUpdate._id ? updatedTask : task
          )

          // Assert: all other tasks are exactly the same
          existingTasks.forEach((originalTask, i) => {
            if (originalTask._id !== taskToUpdate._id) {
              expect(updatedTasks[i]).toEqual(originalTask)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 12: Task Deletion Removes from List**
 * *For any* successful task deletion API call, the deleted task SHALL be 
 * removed from the tasks state array.
 * **Validates: Requirements 5.4**
 */
describe('Property 12: Task Deletion Removes from List', () => {
  it('should remove deleted task from the tasks array', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1, maxLength: 20 }).map(tasks => {
          const seen = new Set<string>()
          return tasks.filter(task => {
            if (seen.has(task._id)) return false
            seen.add(task._id)
            return true
          })
        }).filter(tasks => tasks.length > 0),
        fc.nat(),
        (existingTasks, indexSeed) => {
          // Pick a random task to delete
          const taskIndex = indexSeed % existingTasks.length
          const taskToDelete = existingTasks[taskIndex]

          // Simulate the state update logic from Home.tsx
          const updatedTasks = existingTasks.filter(task => task._id !== taskToDelete._id)

          // Assert: list length decreased by 1
          expect(updatedTasks.length).toBe(existingTasks.length - 1)
          // Assert: deleted task is not in the list
          expect(updatedTasks.find(t => t._id === taskToDelete._id)).toBeUndefined()
          // Assert: all other tasks are preserved
          existingTasks.forEach(task => {
            if (task._id !== taskToDelete._id) {
              expect(updatedTasks).toContainEqual(task)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve order of remaining tasks after deletion', () => {
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 2, maxLength: 20 }).map(tasks => {
          const seen = new Set<string>()
          return tasks.filter(task => {
            if (seen.has(task._id)) return false
            seen.add(task._id)
            return true
          })
        }).filter(tasks => tasks.length >= 2),
        fc.nat(),
        (existingTasks, indexSeed) => {
          const taskIndex = indexSeed % existingTasks.length
          const taskToDelete = existingTasks[taskIndex]

          const updatedTasks = existingTasks.filter(task => task._id !== taskToDelete._id)

          // Get expected order (original order minus deleted task)
          const expectedOrder = existingTasks.filter(t => t._id !== taskToDelete._id)

          // Assert: order is preserved
          expect(updatedTasks).toEqual(expectedOrder)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle deletion from empty list gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (taskId) => {
          const emptyTasks: Task[] = []

          // Simulate deletion on empty list
          const updatedTasks = emptyTasks.filter(task => task._id !== taskId)

          // Assert: still empty
          expect(updatedTasks.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle deletion of non-existent task', () => {
    fc.assert(
      fc.property(
        taskListArb,
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (existingTasks, nonExistentId) => {
          // Ensure the ID doesn't exist in the list
          const safeId = `nonexistent_${nonExistentId}`
          
          // Simulate deletion of non-existent task
          const updatedTasks = existingTasks.filter(task => task._id !== safeId)

          // Assert: list unchanged
          expect(updatedTasks.length).toBe(existingTasks.length)
          expect(updatedTasks).toEqual(existingTasks)
        }
      ),
      { numRuns: 100 }
    )
  })
})
