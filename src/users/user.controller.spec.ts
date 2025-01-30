import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({ id, email: 'test@test.com' } as User),
      find: (email: string) => Promise.resolve([{ id: 1, email } as User]),
      remove: (id: number) =>
        Promise.resolve({ id, email: 'test@test.com' } as User),
      update: (id: number, attrs: Partial<User>) =>
        Promise.resolve({ id, ...attrs } as User),
    };
    fakeAuthService = {
      signup: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user and set session userId', async () => {
    const session = { userId: null };
    const user = await controller.createUser(
      { email: 'test@test.com', password: 'password' },
      session,
    );
    expect(user).toBeDefined();
    expect(session.userId).toEqual(1);
  });

  it('should sign in a user and set session userId', async () => {
    const session = { userId: null };
    const user = await controller.signin(
      { email: 'test@test.com', password: 'password' },
      session,
    );
    expect(user).toBeDefined();
    expect(session.userId).toEqual(1);
  });

  it('should sign out a user and clear session userId', () => {
    const session = { userId: 1 };
    controller.signOut(session);
    expect(session.userId).toBeNull();
  });

  it('should return the current user', () => {
    const user = { id: 1, email: 'test@test.com' } as User;
    const result = controller.whoAmI(user);
    expect(result).toEqual(user);
  });

  it('should find a user by id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('should throw an error if user not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('should find all users by email', async () => {
    const users = await controller.findAllUsers('test@test.com');
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('should remove a user by id', async () => {
    const user = await controller.removeUser('1');
    expect(user).toBeDefined();
  });

  it('should update a user by id', async () => {
    const user = await controller.updateUser('1', {
      email: 'new@test.com',
      password: 'passeord',
    });
    expect(user).toBeDefined();
    expect(user.email).toEqual('new@test.com');
  });
});
