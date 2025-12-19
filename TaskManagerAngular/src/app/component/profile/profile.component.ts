import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { userSignup } from '../../model/signup';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: userSignup | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  editMode = false;

  editableProfile: any = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    password: ''
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data: userSignup) => {
        this.profile = data;
        this.setEditableFields();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  setEditableFields() {
    if (!this.profile) return;

    this.editableProfile = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      dateOfBirth: this.profile.dateOfBirth,
      password: ''  // empty unless changed
    };
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.setEditableFields();
    this.editMode = false;
  }

  saveProfile() {
    if (!this.profile) return;

    const updatedData = {
      ...this.profile,
      ...this.editableProfile,
      email: this.profile.email, // keep same
      role: this.profile.role   // keep same
    };

    this.userService.updateProfile(updatedData).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = '';
        this.profile = updatedData;
        this.editMode = false;
      },
      error: () => {
        this.errorMessage = 'Update failed.';
      }
    });
  }
}
