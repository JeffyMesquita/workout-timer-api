import type { User } from '../entities/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByAppleSub(appleSub: string): Promise<User | null>;
  upsert(user: User): Promise<User>;
}
