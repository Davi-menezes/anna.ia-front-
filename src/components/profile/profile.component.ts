
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../app/services/notification.service';
import { ImageCropperModalComponent } from '../image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ImageCropperModalComponent]
})
export class ProfileComponent {
  userService = inject(UserService);
  notificationService = inject(NotificationService);

  isEditing = signal(false);
  isLoading = signal(false);

  // Estado do modal de recorte de imagem
  isCropperOpen = signal(false);
  selectedFile = signal<File | null>(null);

  // Buffer temporário para edição do perfil
  editForm = signal({
    birthDate: '',
    education: '',
    location: '',
    mainGoal: ''
  });

  creditPercentage = computed(() => {
    const credits = this.userService.credits();
    const maxCredits = this.userService.maxCredits;
    if (maxCredits === 0) return 0;
    return Math.min((credits / maxCredits) * 100, 100);
  });

  // Injeção via construtor para corrigir inferência de tipo do Router
  constructor(private router: Router) { }

  goToCreditsPage() {
    this.router.navigate(['/credits']);
  }

  logout() {
    this.userService.logout();
  }

  editProfile() {
    const u = this.userService.user();
    if (u) {
      this.editForm.set({
        birthDate: u.birthDate ? new Date(u.birthDate).toISOString().split('T')[0] : '',
        education: u.education || '',
        location: u.location || '',
        mainGoal: u.mainGoal || ''
      });
      this.isEditing.set(true);
    }
  }

  async saveProfile() {
    this.isLoading.set(true);
    try {
      await this.userService.updateProfile(this.editForm());
      this.isEditing.set(false);
      this.notificationService.showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      this.notificationService.showError('Erro ao atualizar perfil.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validação: tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.showError('Formato inválido. Use JPEG, PNG ou GIF.');
      return;
    }

    // Validação: tamanho máximo de 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.notificationService.showError('Arquivo muito grande. O limite é 5MB.');
      return;
    }

    // Arquivo válido — abre o recortador
    this.selectedFile.set(file);
    this.isCropperOpen.set(true);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  }

  async onImageCropped(blob: Blob) {
    this.isCropperOpen.set(false);
    this.isLoading.set(true);

    try {
      const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
      await this.userService.updateProfilePicture(file);
      this.notificationService.showSuccess('Foto de perfil atualizada!');
    } catch (error: any) {
      const message = error.message || 'Erro ao atualizar foto de perfil.';
      this.notificationService.showError(message);
    } finally {
      this.isLoading.set(false);
      this.selectedFile.set(null);
    }
  }
}
