import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly user$: Observable<User | null>;
  public currentUserId: string | null = null;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
    this.user$.subscribe(user => {
      this.currentUserId = user ? user.uid : null;
    });
  }

  signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
} 