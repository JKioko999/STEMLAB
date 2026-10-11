import { School, User, ClassGroup, Assignment, Attempt } from '../types';

/**
 * ============================================================================
 * STEM-SPARK-LAB DATA STORE
 * ============================================================================
 * All dummy schools, users, classes, assignments, and attempts have been removed.
 * Data is created dynamically by registering real secondary schools, teachers,
 * and students or by connecting a live Supabase PostgreSQL database.
 * The standard KCSE laboratory experiments remain intact in 'experimentSpecs.ts'.
 * ============================================================================
 */

export const SEED_SCHOOLS: School[] = [];
export const SEED_USERS: User[] = [];
export const SEED_CLASSES: ClassGroup[] = [];
export const SEED_ASSIGNMENTS: Assignment[] = [];
export const SEED_ATTEMPTS: Attempt[] = [];
