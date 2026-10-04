import { School, User, ClassGroup, Assignment, Attempt, ExperimentSpec, EmailDispatch } from '../../src/types';
import { 
  SEED_SCHOOLS, 
  SEED_USERS, 
  SEED_CLASSES, 
  SEED_ASSIGNMENTS, 
  SEED_ATTEMPTS 
} from '../../src/data/seedData';
import { INITIAL_EXPERIMENTS } from '../../src/data/experimentSpecs';

/**
 * ============================================================================
 * SERVER-SIDE DATA STORAGE (SUPABASE-READY IN-MEMORY STORE)
 * ============================================================================
 * When Supabase environment variables are provided, the routes can persist to
 * PostgreSQL tables. Otherwise, this store holds full application state and
 * serves as a zero-setup local backend database.
 * ============================================================================
 */

export class BackendDataStore {
  public schools: School[] = [...SEED_SCHOOLS];
  public users: User[] = [...SEED_USERS];
  public classes: ClassGroup[] = [...SEED_CLASSES];
  public experiments: ExperimentSpec[] = [...INITIAL_EXPERIMENTS];
  public assignments: Assignment[] = [...SEED_ASSIGNMENTS];
  public attempts: Attempt[] = [...SEED_ATTEMPTS];
  public emails: EmailDispatch[] = [];

  // Reset helper
  public resetToDefaults() {
    this.schools = [...SEED_SCHOOLS];
    this.users = [...SEED_USERS];
    this.classes = [...SEED_CLASSES];
    this.experiments = [...INITIAL_EXPERIMENTS];
    this.assignments = [...SEED_ASSIGNMENTS];
    this.attempts = [...SEED_ATTEMPTS];
    this.emails = [];
  }
}

export const store = new BackendDataStore();
