-- Pollards booking schema. Applied by `npm run db:migrate`; never edit once applied —
-- add a new numbered migration instead (the runner rejects changed checksums).

CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  name text NOT NULL,
  phone text NOT NULL,
  -- NULL until the registration wizard is completed.
  registered_at timestamptz,
  birth_date date,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  address text,
  occupation text,
  emergency_contact_name text,
  emergency_contact_number text,
  primary_physician text,
  insurance_provider text,
  insurance_policy_number text,
  allergies text,
  current_medication text,
  family_medical_history text,
  past_medical_history text,
  identification_type text,
  identification_number text,
  -- Path relative to UPLOAD_DIR; files are never served publicly.
  identification_document text,
  treatment_consent boolean NOT NULL DEFAULT false,
  disclosure_consent boolean NOT NULL DEFAULT false,
  privacy_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  primary_physician text NOT NULL,
  schedule timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'cancelled')),
  reason text NOT NULL,
  note text,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The database itself guarantees no double booking: a clinician can hold only one
-- active (pending or scheduled) appointment per slot. Cancelled ones free the slot.
CREATE UNIQUE INDEX appointments_active_slot
  ON appointments (primary_physician, schedule)
  WHERE status IN ('pending', 'scheduled');

CREATE INDEX appointments_created_at ON appointments (created_at DESC);
CREATE INDEX appointments_patient_id ON appointments (patient_id);
CREATE INDEX appointments_schedule ON appointments (schedule);

-- One-time email sign-in codes. Only a keyed hash of the code is stored.
CREATE TABLE login_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX login_codes_email ON login_codes (email, created_at DESC);
