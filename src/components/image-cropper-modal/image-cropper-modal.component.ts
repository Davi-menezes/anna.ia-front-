
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';

@Component({
    selector: 'app-image-cropper-modal',
    standalone: true,
    imports: [CommonModule, ImageCropperComponent],
    templateUrl: './image-cropper-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageCropperModalComponent {
    @Input() imageFile: File | null = null;
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() cropped = new EventEmitter<Blob>();

    croppedImage = signal<any>(null);
    scale = signal(1);
    transform = signal<any>({});
    loading = signal(true);

    onClose() {
        this.close.emit();
    }

    imageCropped(event: ImageCroppedEvent) {
        if (event.blob) {
            this.croppedImage.set(event.blob);
        }
    }

    imageLoaded(image: LoadedImage) {
        this.loading.set(false);
    }

    loadImageFailed() {
        // Falha ao carregar imagem
    }

    zoomOut() {
        this.scale.update(s => Math.max(1, s - 0.1));
        this.updateTransform();
    }

    zoomIn() {
        this.scale.update(s => Math.min(3, s + 0.1));
        this.updateTransform();
    }

    rotate() {
        this.transform.update(t => ({
            ...t,
            rotate: (t.rotate || 0) + 90
        }));
    }

    flipH() {
        this.transform.update(t => ({
            ...t,
            flipH: !t.flipH
        }));
    }

    flipV() {
        this.transform.update(t => ({
            ...t,
            flipV: !t.flipV
        }));
    }

    private updateTransform() {
        this.transform.update(t => ({
            ...t,
            scale: this.scale()
        }));
    }

    save() {
        const blob = this.croppedImage();
        if (blob) {
            this.cropped.emit(blob);
        }
    }
}
