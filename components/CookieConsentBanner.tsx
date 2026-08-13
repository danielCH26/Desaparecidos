'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'desaparecidos_cookie_consent_v1';

type Consent = 'all' | 'essential' | null;

interface CategoryState {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const DEFAULT_CATEGORIES: CategoryState = {
  essential: true, // always on, can't be turned off
  functional: false,
  analytics: false,
};

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] =
    useState<CategoryState>(DEFAULT_CATEGORIES);

  useEffect(() => {
    // Read stored consent on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setShowBanner(true);
      }
    } catch {
      // localStorage unavailable (e.g., SSR or disabled cookies)
      setShowBanner(false);
    }
  }, []);

  function persist(consent: Consent, cats: CategoryState) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ consent, categories: cats, at: Date.now() })
      );
    } catch {
      // ignore
    }
  }

  function acceptAll() {
    const cats = { essential: true, functional: true, analytics: true };
    setCategories(cats);
    persist('all', cats);
    setShowBanner(false);
  }

  function acceptEssential() {
    const cats = { essential: true, functional: false, analytics: false };
    setCategories(cats);
    persist('essential', cats);
    setShowBanner(false);
  }

  function saveCustom() {
    persist(null, categories);
    setShowBanner(false);
  }

  function close() {
    // Closing defaults to "essential only"
    acceptEssential();
  }

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-lg p-4 max-h-[80vh] overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-base font-semibold mb-2">
              Usamos cookies
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Usamos cookies estrictamente necesarias para que el servicio
              funcione. No usamos cookies de análisis ni marketing.{' '}
              <Link
                href="/legal/cookies"
                className="text-blue-600 underline min-h-[44px] inline-flex items-center"
              >
                Más información
              </Link>
              .
            </p>

            {showDetails && (
              <div className="mt-3 border-t pt-3 space-y-2">
                <CategoryRow
                  label="Esenciales (necesarias)"
                  description="Sesión, autenticación, seguridad. No se pueden desactivar."
                  checked={true}
                  disabled={true}
                  onChange={() => {}}
                />
                <CategoryRow
                  label="Funcionales"
                  description="Recordar preferencias (no usadas actualmente)."
                  checked={categories.functional}
                  onChange={(v) =>
                    setCategories({ ...categories, functional: v })
                  }
                />
                <CategoryRow
                  label="Analíticas"
                  description="Estadísticas de uso (no usadas actualmente)."
                  checked={categories.analytics}
                  onChange={(v) =>
                    setCategories({ ...categories, analytics: v })
                  }
                />
              </div>
            )}

            {!showDetails && (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-sm text-blue-600 underline min-h-[44px] inline-flex items-center"
              >
                Personalizar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={acceptEssential}
            className="min-h-[44px] px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Solo necesarias
          </button>
          {showDetails && (
            <button
              type="button"
              onClick={saveCustom}
              className="min-h-[44px] px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-50"
            >
              Guardar mi elección
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 ${
        disabled ? 'opacity-70' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 min-h-[20px] min-w-[20px]"
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </label>
  );
}
