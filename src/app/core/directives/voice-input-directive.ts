import { Directive, ElementRef, inject, OnDestroy, signal } from '@angular/core';

// Minimal Web Speech API surface — not part of standard lib.dom typings
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Voice dictation for text inputs via the Web Speech API.
 * Inserts final transcripts at the cursor position and emits a
 * native 'input' event so form bindings (signal forms) stay in sync.
 *
 * Usage: <textarea appVoiceInput #voice="appVoiceInput"></textarea>
 * Render the trigger button only when `voice.supported` is true.
 */
@Directive({
  selector: 'textarea[appVoiceInput], input[appVoiceInput]',
  exportAs: 'appVoiceInput',
})
export class VoiceInput implements OnDestroy {
  private host = inject<ElementRef<HTMLTextAreaElement | HTMLInputElement>>(ElementRef);
  private recognition: SpeechRecognitionLike | null = null;

  readonly supported = getSpeechRecognitionCtor() !== undefined;
  readonly listening = signal(false);
  // True when the user denied microphone permission
  readonly permissionDenied = signal(false);

  toggle() {
    if (this.listening()) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'es-PE';
    // Keep listening across phrases; mobile engines end on long silence
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          this.insertAtCursor(result[0].transcript);
        }
      }
    };
    // Identity check: a stale onend from a stopped session must not
    // turn off a newer session started right after (fast re-tap)
    recognition.onend = () => {
      if (this.recognition === recognition) {
        this.listening.set(false);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        this.permissionDenied.set(true);
      }
      if (this.recognition === recognition) {
        this.listening.set(false);
      }
    };

    this.recognition = recognition;
    this.permissionDenied.set(false);
    this.listening.set(true);
    recognition.start();
  }

  private stopListening() {
    this.recognition?.stop();
    this.recognition = null;
    this.listening.set(false);
  }

  private insertAtCursor(transcript: string) {
    if (!transcript.trim()) return; // spurious empty results in continuous mode

    const el = this.host.nativeElement;
    const value = el.value;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;

    // Add a separating space when inserting right after existing text
    const needsSpace = start > 0 && !/\s$/.test(value.slice(0, start));
    const inserted = (needsSpace ? ' ' : '') + transcript.trim();

    el.value = value.slice(0, start) + inserted + value.slice(end);
    const cursor = start + inserted.length;
    el.setSelectionRange(cursor, cursor);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  ngOnDestroy() {
    this.recognition?.abort();
  }
}
