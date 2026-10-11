import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch } from '../../src/types';
import { INITIAL_EXPERIMENTS } from '../../src/data/experimentSpecs';

/**
 * ============================================================================
 * SERVER-SIDE DATA STORAGE
 * ============================================================================
 * Holds live application data in memory when operating without external Supabase
 * credentials. Standard KCSE experiments remain available; all schools, users,
 * classes, assignments, and attempts start clean and are populated as you create
 * them in your live database.
 * ============================================================================
 */

export class BackendDataStore {
  public schools: School[] = [];
  public users: User[] = [];
  public classes: ClassGroup[] = [];
  public experiments: ExperimentSpec[] = [...INITIAL_EXPERIMENTS];
  public assignments: Assignment[] = [];
  public attempts: Attempt[] = [];
  public emails: EmailDispatch[] = [];

  // Reset helper
  public resetToDefaults() {
    this.schools = [];
    this.users = [];
    this.classes = [];
    this.experiments = [...INITIAL_EXPERIMENTS];
    this.assignments = [];
    this.attempts = [];
    this.emails = [];
  }
}

export const store = new BackendDataStore();
