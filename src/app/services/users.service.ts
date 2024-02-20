import { Injectable, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Subject, from, tap } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';
import { IUsuaris } from '../interfaces/usuaris';

const emptyUser: IUsuaris = {
  id: '0',
  avatar_url: 'none',
  full_name: 'none',
  username: 'none',
  website: 'none',
};

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnInit {
  supaClient: any = null;

  userSubject: BehaviorSubject<IUsuaris> = new BehaviorSubject<IUsuaris>(emptyUser);
  favoritesSubject: Subject<{ id: number; id_artwork: number; id_user: string }[]> =
    new Subject();

  constructor() {}
  
  ngOnInit(): void {}

  createSupa() {
    this.supaClient = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }
  async setProfile(formulario: FormGroup) {
    const formData = formulario.value;
    console.log('save');
  
    try {
      const { data: profileData } = await this.fetchUserProfile(formData.id);
  
      if (!profileData) {
        console.log('first time');
        await this.insertProfile(formData);
      } else {
        console.log('actu');
        await this.updateProfile(formData);
      }
  
    } catch (error) {
      console.error('Error fetching or updating profile:', error);
    }
  }
  
  private async fetchUserProfile(userId: string) {
    return this.supaClient.from('profiles').select().eq('id', userId).single();
  }
  
  private async insertProfile(formData: any) {
    try {
      const { data: insertedData } = await this.supaClient.from('profiles').insert([
        {
          id: formData.id,
          username: formData.username,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          website: formData.website,
        },
      ]);
    } catch (insertError) {
      console.error('Error inserting profile:', insertError);
    }
  }
  
  async updateProfile(formData: any) {
    try {
      const { data: updatedData } = await this.supaClient.from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          website: formData.website,
        })
        .eq('id', formData.id);
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
    }
  }

  async register(email: string, password: string): Promise<any> {
    this.createSupa();

    const { user, error } = await this.supaClient.auth.signUp({
      email,
      password,
    }); 
    if (error) {
      if (error.message.includes('Password should be at least 6 characters.')) {
        return {
          success: false,
          message: 'Password should be at least 6 characters.',
        };
      } else return { success: false, message: error.message };
    }
    return { success: true, user };
  }
  

  deleteFavorites(id_artwork: number): void {
    let uid = localStorage.getItem('uid');
    if (uid) {
      let promiseDelete: Promise<{
        data: { id: number; id_artwork: number; id_user: string }[];
      }> = this.supaClient
        .from('favorite')
        .delete()
        .eq('id_user', "" + uid)
        .eq('id_artwork', id_artwork)
       

        promiseDelete.then((data) => {
          this.favoritesSubject.next(data.data);
        });
    }
  }

  getProfile(): void {
    const uid = localStorage.getItem('uid');

    let profilePromise: Promise<{ data: IUsuaris[] }> = this.supaClient
      .from('profiles')
      .select('*')
      .eq('id', uid);

    from(profilePromise)
      .pipe(tap((data) => console.log(data)))
      .subscribe(async (profile: { data: IUsuaris[] }) => {
        this.userSubject.next(profile.data[0]);
       
      });
  }

  getFavorites(): void {
    let uid = localStorage.getItem('uid');
    if (uid) {
      let promiseFavorites: Promise<{
        data: { id: number; id_artwork: number; id_user: string }[];
      }> = this.supaClient
        .from('favorite')
        .select('*')
        .eq('id_user', ""+uid);

      promiseFavorites.then((data) => {
        this.favoritesSubject.next(data.data);
      });
    }
  }

  async isLogged(): Promise<boolean> {
    this.createSupa();
    const session = await this.supaClient.auth.getSession();

    if (session.data.session) {
      this.getProfile();
      return true;
    }
    return false;
  }
  async login(email: string, password: string): Promise<any> {
    this.createSupa();
    const { data, error } = await this.supaClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          message: 'Email not confirmed.',
        };
      } else if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          message: 'Invalid login credentials.',
        };
      } else return { success: false, message: error.message };
    }
    const uid = data.session.user.id;
    localStorage.setItem('uid', uid);
    this.getProfile();

    return { success: true, data };
  }

  async logout() {
    const { error } = await this.supaClient.auth.signOut();
    this.userSubject.next(emptyUser);
  }


  async setFavorites(id_artwork: string): Promise<void> {
    try {
      let uid = localStorage.getItem('uid');
  
      let { data, error } = await this.supaClient.auth.getSession();
  
      const existingEntry = await this.supaClient
        .from('favorite')
        .select('id')
        .eq('id_artwork', id_artwork)
        .eq('id_user', uid)
        .single();
        
      if (existingEntry.status===406) {
        let promiseFavorites: Promise<boolean> = this.supaClient
          .from('favorite')
          .insert([{ id_artwork: id_artwork, id_user: uid }]);
        await promiseFavorites;
  
        console.log('Artwork added to favorites successfully.');
      } else {
        console.log('Artwork is already in favorites.');
      }
  
    } catch (error) {
      console.error('Error while adding artwork to favorites:', error);
    }
  }

}
