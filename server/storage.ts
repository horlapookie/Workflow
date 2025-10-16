import { type User, type InsertUser, type Deployment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDeployment(deployment: Omit<Deployment, 'id' | 'createdAt'>): Promise<Deployment>;
  getDeployment(id: string): Promise<Deployment | undefined>;
  getAllDeployments(): Promise<Deployment[]>;
  updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  deleteDeployment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private deployments: Map<string, Deployment>;

  constructor() {
    this.users = new Map();
    this.deployments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDeployment(deployment: Omit<Deployment, 'id' | 'createdAt'>): Promise<Deployment> {
    const id = randomUUID();
    const newDeployment: Deployment = { 
      ...deployment, 
      id,
      createdAt: new Date()
    };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async getAllDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values());
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const deployment = this.deployments.get(id);
    if (!deployment) return undefined;
    
    const updated = { ...deployment, ...updates };
    this.deployments.set(id, updated);
    return updated;
  }

  async deleteDeployment(id: string): Promise<boolean> {
    return this.deployments.delete(id);
  }
}

export const storage = new MemStorage();
