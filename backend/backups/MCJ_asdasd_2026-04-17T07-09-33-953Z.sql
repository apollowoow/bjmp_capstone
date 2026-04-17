--
-- PostgreSQL database dump
--

\restrict 2fuuQY37PiBrsjdf2aGjZcGnwd9Sqlq5A6hdocatnmScP725zUruQB4WTbq2vWQ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.usertbl DROP CONSTRAINT IF EXISTS usertbl_roleid_fkey;
ALTER TABLE IF EXISTS ONLY public.tastm_days_log DROP CONSTRAINT IF EXISTS tastm_days_log_pdl_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rolepermissiontable DROP CONSTRAINT IF EXISTS rolepermissiontable_roleid_fkey;
ALTER TABLE IF EXISTS ONLY public.rolepermissiontable DROP CONSTRAINT IF EXISTS rolepermissiontable_moduleid_fkey;
ALTER TABLE IF EXISTS ONLY public.released_tbl DROP CONSTRAINT IF EXISTS released_tbl_pdl_id_fkey;
ALTER TABLE IF EXISTS ONLY public.incident_tbl DROP CONSTRAINT IF EXISTS incident_tbl_pdl_id_fkey;
ALTER TABLE IF EXISTS ONLY public.gcta_days_log DROP CONSTRAINT IF EXISTS gcta_days_log_pdl_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pdl_subsidiary_tbl DROP CONSTRAINT IF EXISTS fk_pdl_subsidiary;
ALTER TABLE IF EXISTS ONLY public.audit_log_tbl DROP CONSTRAINT IF EXISTS audit_log_tbl_pdl_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_tbl DROP CONSTRAINT IF EXISTS attendance_tbl_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_tbl DROP CONSTRAINT IF EXISTS attendance_tbl_pdl_id_fkey;
DROP INDEX IF EXISTS public.idx_audit_user_id;
DROP INDEX IF EXISTS public.idx_audit_timestamp;
DROP INDEX IF EXISTS public.idx_audit_pdl_id;
ALTER TABLE IF EXISTS ONLY public.usertbl DROP CONSTRAINT IF EXISTS usertbl_username_key;
ALTER TABLE IF EXISTS ONLY public.usertbl DROP CONSTRAINT IF EXISTS usertbl_pkey;
ALTER TABLE IF EXISTS ONLY public.tastm_days_log DROP CONSTRAINT IF EXISTS tastm_days_log_pkey;
ALTER TABLE IF EXISTS ONLY public.session_tbl DROP CONSTRAINT IF EXISTS session_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.roletbl DROP CONSTRAINT IF EXISTS roletbl_rolename_key;
ALTER TABLE IF EXISTS ONLY public.roletbl DROP CONSTRAINT IF EXISTS roletbl_pkey;
ALTER TABLE IF EXISTS ONLY public.rolepermissiontable DROP CONSTRAINT IF EXISTS rolepermissiontable_pkey;
ALTER TABLE IF EXISTS ONLY public.released_tbl DROP CONSTRAINT IF EXISTS released_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.pdl_tbl DROP CONSTRAINT IF EXISTS pdl_tbl_rfid_number_key;
ALTER TABLE IF EXISTS ONLY public.pdl_tbl DROP CONSTRAINT IF EXISTS pdl_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.pdl_subsidiary_tbl DROP CONSTRAINT IF EXISTS pdl_subsidiary_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.moduletbl DROP CONSTRAINT IF EXISTS moduletbl_pkey;
ALTER TABLE IF EXISTS ONLY public.moduletbl DROP CONSTRAINT IF EXISTS moduletbl_modulename_key;
ALTER TABLE IF EXISTS ONLY public.incident_tbl DROP CONSTRAINT IF EXISTS incident_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.gcta_days_log DROP CONSTRAINT IF EXISTS gcta_days_log_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_log_tbl DROP CONSTRAINT IF EXISTS audit_log_tbl_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_tbl DROP CONSTRAINT IF EXISTS attendance_tbl_pkey;
ALTER TABLE IF EXISTS public.usertbl ALTER COLUMN userid DROP DEFAULT;
ALTER TABLE IF EXISTS public.tastm_days_log ALTER COLUMN tastm_log_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.session_tbl ALTER COLUMN session_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roletbl ALTER COLUMN roleid DROP DEFAULT;
ALTER TABLE IF EXISTS public.rolepermissiontable ALTER COLUMN rolepermissionid DROP DEFAULT;
ALTER TABLE IF EXISTS public.released_tbl ALTER COLUMN release_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pdl_tbl ALTER COLUMN pdl_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pdl_subsidiary_tbl ALTER COLUMN subsidiary_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.moduletbl ALTER COLUMN moduleid DROP DEFAULT;
ALTER TABLE IF EXISTS public.incident_tbl ALTER COLUMN incident_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.gcta_days_log ALTER COLUMN gcta_log_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_log_tbl ALTER COLUMN log_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance_tbl ALTER COLUMN attendance_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usertbl_userid_seq;
DROP TABLE IF EXISTS public.usertbl;
DROP SEQUENCE IF EXISTS public.tastm_days_log_tastm_log_id_seq;
DROP TABLE IF EXISTS public.tastm_days_log;
DROP SEQUENCE IF EXISTS public.session_tbl_session_id_seq;
DROP TABLE IF EXISTS public.session_tbl;
DROP SEQUENCE IF EXISTS public.roletbl_roleid_seq;
DROP TABLE IF EXISTS public.roletbl;
DROP SEQUENCE IF EXISTS public.rolepermissiontable_rolepermissionid_seq;
DROP TABLE IF EXISTS public.rolepermissiontable;
DROP SEQUENCE IF EXISTS public.released_tbl_release_id_seq;
DROP TABLE IF EXISTS public.released_tbl;
DROP SEQUENCE IF EXISTS public.pdl_tbl_pdl_id_seq;
DROP TABLE IF EXISTS public.pdl_tbl;
DROP SEQUENCE IF EXISTS public.pdl_subsidiary_tbl_subsidiary_id_seq;
DROP TABLE IF EXISTS public.pdl_subsidiary_tbl;
DROP SEQUENCE IF EXISTS public.moduletbl_moduleid_seq;
DROP TABLE IF EXISTS public.moduletbl;
DROP SEQUENCE IF EXISTS public.incident_tbl_incident_id_seq;
DROP TABLE IF EXISTS public.incident_tbl;
DROP SEQUENCE IF EXISTS public.gcta_days_log_gcta_log_id_seq;
DROP TABLE IF EXISTS public.gcta_days_log;
DROP SEQUENCE IF EXISTS public.audit_log_tbl_log_id_seq;
DROP TABLE IF EXISTS public.audit_log_tbl;
DROP SEQUENCE IF EXISTS public.attendance_tbl_attendance_id_seq;
DROP TABLE IF EXISTS public.attendance_tbl;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_tbl (
    attendance_id integer NOT NULL,
    pdl_id integer,
    session_id integer,
    hours_attended numeric(4,2),
    timestamp_in timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'Active'::character varying,
    row_hash text,
    remarks text DEFAULT ''::text
);


ALTER TABLE public.attendance_tbl OWNER TO postgres;

--
-- Name: attendance_tbl_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_tbl_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_tbl_attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_tbl_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_tbl_attendance_id_seq OWNED BY public.attendance_tbl.attendance_id;


--
-- Name: audit_log_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log_tbl (
    log_id integer NOT NULL,
    user_id integer,
    action_type character varying(50),
    table_name character varying(50),
    record_id integer,
    details jsonb,
    ip_address character varying(50),
    "timestamp" timestamp without time zone DEFAULT now(),
    pdl_id integer
);


ALTER TABLE public.audit_log_tbl OWNER TO postgres;

--
-- Name: audit_log_tbl_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_tbl_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_tbl_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_tbl_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_tbl_log_id_seq OWNED BY public.audit_log_tbl.log_id;


--
-- Name: gcta_days_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gcta_days_log (
    gcta_log_id integer NOT NULL,
    pdl_id integer,
    month_year date NOT NULL,
    days_earned integer DEFAULT 0,
    date_granted timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'Granted'::character varying,
    remarks text,
    row_hash text
);


ALTER TABLE public.gcta_days_log OWNER TO postgres;

--
-- Name: gcta_days_log_gcta_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gcta_days_log_gcta_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gcta_days_log_gcta_log_id_seq OWNER TO postgres;

--
-- Name: gcta_days_log_gcta_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gcta_days_log_gcta_log_id_seq OWNED BY public.gcta_days_log.gcta_log_id;


--
-- Name: incident_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incident_tbl (
    incident_id integer NOT NULL,
    pdl_id integer,
    incident_date date NOT NULL,
    category character varying(50),
    penalty_end_date date NOT NULL,
    remarks text,
    status character varying(20) DEFAULT 'Active'::character varying
);


ALTER TABLE public.incident_tbl OWNER TO postgres;

--
-- Name: incident_tbl_incident_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incident_tbl_incident_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incident_tbl_incident_id_seq OWNER TO postgres;

--
-- Name: incident_tbl_incident_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incident_tbl_incident_id_seq OWNED BY public.incident_tbl.incident_id;


--
-- Name: moduletbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.moduletbl (
    moduleid integer NOT NULL,
    modulename character varying(50) NOT NULL,
    moduledescription text
);


ALTER TABLE public.moduletbl OWNER TO postgres;

--
-- Name: moduletbl_moduleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.moduletbl_moduleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.moduletbl_moduleid_seq OWNER TO postgres;

--
-- Name: moduletbl_moduleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.moduletbl_moduleid_seq OWNED BY public.moduletbl.moduleid;


--
-- Name: pdl_subsidiary_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pdl_subsidiary_tbl (
    subsidiary_id integer NOT NULL,
    pdl_id integer NOT NULL,
    total_fine_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    daily_rate numeric(10,2) DEFAULT 0.00 NOT NULL,
    max_subsidiary_days integer NOT NULL,
    judgment_date date,
    status character varying(20) DEFAULT 'Active'::character varying,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pdl_subsidiary_tbl_status_check CHECK (((status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Paid'::character varying)::text, ('Served'::character varying)::text, ('Cancelled'::character varying)::text])))
);


ALTER TABLE public.pdl_subsidiary_tbl OWNER TO postgres;

--
-- Name: pdl_subsidiary_tbl_subsidiary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pdl_subsidiary_tbl_subsidiary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pdl_subsidiary_tbl_subsidiary_id_seq OWNER TO postgres;

--
-- Name: pdl_subsidiary_tbl_subsidiary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pdl_subsidiary_tbl_subsidiary_id_seq OWNED BY public.pdl_subsidiary_tbl.subsidiary_id;


--
-- Name: pdl_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pdl_tbl (
    pdl_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    gender character varying(10),
    birthday date NOT NULL,
    pdl_status character varying(50) DEFAULT 'Detained'::character varying,
    date_commited_pnp date,
    date_admitted_bjmp date,
    sentence_years integer DEFAULT 0,
    sentence_months integer DEFAULT 0,
    sentence_days integer DEFAULT 0,
    original_release_date date,
    expected_releasedate date,
    rfid_number character varying(50),
    pdl_picture text,
    is_locked_for_gcta boolean DEFAULT false,
    total_timeallowance_earned integer DEFAULT 0,
    case_number character varying(50),
    crime_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_legally_disqualified boolean DEFAULT false,
    disqualification_reason text,
    date_of_final_judgment date
);


ALTER TABLE public.pdl_tbl OWNER TO postgres;

--
-- Name: pdl_tbl_pdl_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pdl_tbl_pdl_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pdl_tbl_pdl_id_seq OWNER TO postgres;

--
-- Name: pdl_tbl_pdl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pdl_tbl_pdl_id_seq OWNED BY public.pdl_tbl.pdl_id;


--
-- Name: released_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.released_tbl (
    release_id integer NOT NULL,
    pdl_id integer,
    first_name character varying(100),
    last_name character varying(100),
    middle_name character varying(100),
    birthday date,
    gender character varying(10),
    crime_name text,
    sentence_years integer,
    sentence_months integer,
    sentence_days integer,
    total_credits_applied integer,
    date_commited_pnp date,
    actual_release_date date DEFAULT CURRENT_DATE,
    remarks text DEFAULT 'Successful Completion of Sentence'::text,
    date_admitted_bjmp date,
    is_legally_disqualified boolean DEFAULT false,
    date_of_final_judgment date
);


ALTER TABLE public.released_tbl OWNER TO postgres;

--
-- Name: released_tbl_release_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.released_tbl_release_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.released_tbl_release_id_seq OWNER TO postgres;

--
-- Name: released_tbl_release_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.released_tbl_release_id_seq OWNED BY public.released_tbl.release_id;


--
-- Name: rolepermissiontable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rolepermissiontable (
    rolepermissionid integer NOT NULL,
    roleid integer NOT NULL,
    moduleid integer NOT NULL,
    canview boolean DEFAULT false,
    cancreate boolean DEFAULT false,
    canedit boolean DEFAULT false,
    candelete boolean DEFAULT false,
    canapprove boolean DEFAULT false
);


ALTER TABLE public.rolepermissiontable OWNER TO postgres;

--
-- Name: rolepermissiontable_rolepermissionid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rolepermissiontable_rolepermissionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rolepermissiontable_rolepermissionid_seq OWNER TO postgres;

--
-- Name: rolepermissiontable_rolepermissionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rolepermissiontable_rolepermissionid_seq OWNED BY public.rolepermissiontable.rolepermissionid;


--
-- Name: roletbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roletbl (
    roleid integer NOT NULL,
    rolename character varying(50) NOT NULL,
    roledescription text
);


ALTER TABLE public.roletbl OWNER TO postgres;

--
-- Name: roletbl_roleid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roletbl_roleid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roletbl_roleid_seq OWNER TO postgres;

--
-- Name: roletbl_roleid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roletbl_roleid_seq OWNED BY public.roletbl.roleid;


--
-- Name: session_tbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_tbl (
    session_id integer NOT NULL,
    program_name character varying(100),
    session_name character varying(100),
    hours_to_earn numeric(4,2),
    session_date date,
    officer_in_charge text
);


ALTER TABLE public.session_tbl OWNER TO postgres;

--
-- Name: session_tbl_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.session_tbl_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.session_tbl_session_id_seq OWNER TO postgres;

--
-- Name: session_tbl_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.session_tbl_session_id_seq OWNED BY public.session_tbl.session_id;


--
-- Name: tastm_days_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tastm_days_log (
    tastm_log_id integer NOT NULL,
    pdl_id integer,
    month_year date NOT NULL,
    total_hours_accumulated numeric(6,2),
    days_earned integer DEFAULT 0,
    date_granted timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    remarks text,
    status character varying(20) DEFAULT 'Active'::character varying,
    row_hash text
);


ALTER TABLE public.tastm_days_log OWNER TO postgres;

--
-- Name: tastm_days_log_tastm_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tastm_days_log_tastm_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tastm_days_log_tastm_log_id_seq OWNER TO postgres;

--
-- Name: tastm_days_log_tastm_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tastm_days_log_tastm_log_id_seq OWNED BY public.tastm_days_log.tastm_log_id;


--
-- Name: usertbl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usertbl (
    userid integer NOT NULL,
    username character varying(50) NOT NULL,
    password text NOT NULL,
    fullname character varying(100),
    roleid integer,
    status character varying(20) DEFAULT 'Active'::character varying
);


ALTER TABLE public.usertbl OWNER TO postgres;

--
-- Name: usertbl_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usertbl_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usertbl_userid_seq OWNER TO postgres;

--
-- Name: usertbl_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usertbl_userid_seq OWNED BY public.usertbl.userid;


--
-- Name: attendance_tbl attendance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_tbl ALTER COLUMN attendance_id SET DEFAULT nextval('public.attendance_tbl_attendance_id_seq'::regclass);


--
-- Name: audit_log_tbl log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_tbl ALTER COLUMN log_id SET DEFAULT nextval('public.audit_log_tbl_log_id_seq'::regclass);


--
-- Name: gcta_days_log gcta_log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gcta_days_log ALTER COLUMN gcta_log_id SET DEFAULT nextval('public.gcta_days_log_gcta_log_id_seq'::regclass);


--
-- Name: incident_tbl incident_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_tbl ALTER COLUMN incident_id SET DEFAULT nextval('public.incident_tbl_incident_id_seq'::regclass);


--
-- Name: moduletbl moduleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moduletbl ALTER COLUMN moduleid SET DEFAULT nextval('public.moduletbl_moduleid_seq'::regclass);


--
-- Name: pdl_subsidiary_tbl subsidiary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_subsidiary_tbl ALTER COLUMN subsidiary_id SET DEFAULT nextval('public.pdl_subsidiary_tbl_subsidiary_id_seq'::regclass);


--
-- Name: pdl_tbl pdl_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_tbl ALTER COLUMN pdl_id SET DEFAULT nextval('public.pdl_tbl_pdl_id_seq'::regclass);


--
-- Name: released_tbl release_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.released_tbl ALTER COLUMN release_id SET DEFAULT nextval('public.released_tbl_release_id_seq'::regclass);


--
-- Name: rolepermissiontable rolepermissionid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermissiontable ALTER COLUMN rolepermissionid SET DEFAULT nextval('public.rolepermissiontable_rolepermissionid_seq'::regclass);


--
-- Name: roletbl roleid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roletbl ALTER COLUMN roleid SET DEFAULT nextval('public.roletbl_roleid_seq'::regclass);


--
-- Name: session_tbl session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_tbl ALTER COLUMN session_id SET DEFAULT nextval('public.session_tbl_session_id_seq'::regclass);


--
-- Name: tastm_days_log tastm_log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tastm_days_log ALTER COLUMN tastm_log_id SET DEFAULT nextval('public.tastm_days_log_tastm_log_id_seq'::regclass);


--
-- Name: usertbl userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertbl ALTER COLUMN userid SET DEFAULT nextval('public.usertbl_userid_seq'::regclass);


--
-- Data for Name: attendance_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_tbl (attendance_id, pdl_id, session_id, hours_attended, timestamp_in, status, row_hash, remarks) FROM stdin;
1	8	191	2.00	2026-04-09 14:41:37.957	Active	05bca69d66115538984737f1f590acdabe4e504ca9a23d1980d9c3e4b887b883	Original System Log
2	3	191	2.00	2026-04-09 14:42:03.128	Active	957bf55952ee7caf5599e3d4e31cd0d6e4b8d6a4147b019a988dd1eba6dd9a17	Original System Log
3	1	191	2.00	2026-04-09 14:45:46.667	Active	bab92675d319e994519bece6c9b2d319d457e88232549280e65dfe81d930832e	Original System Log | MANUALLY ADJUSTED: 4/9/2026 2:45:46 PM
4	4	191	2.00	2026-04-09 14:42:48.527	Released	46dba8d5df72353a9a97f1b69236bc4975bb91e17fbcad476f3b3962be3991ee	Original System Log
6	6	194	4.00	2026-04-17 12:00:57.803	Active	a1baeae8e7fc287b0769368aa0d0f6902bf8f74c883c8565a3a3b3d0a63e10be	REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM | MANUALLY ADJUSTED: 4/17/2026 12:00:33 PM | MANUALLY ADJUSTED: 4/17/2026 12:00:57 PM
7	6	195	2.00	2026-04-17 12:15:52.378	Active	e4622ba70300e13acfe73c8fa10f7f8d3aae6b8a46019a40f666acc8a58a24a2	Original System Log
8	1	195	2.00	2026-04-17 12:16:10.22	Active	098802711dcc30f30d59cab9cb5355ce6b7625edd61f014cabca46919c43e823	Original System Log
9	2	195	2.00	2026-04-17 12:16:15.958	Active	570b80ca3a7d3a658f5956cd01f3d49046e289978862f87b8f862bf8f8f25780	Original System Log
10	6	198	3.00	2026-04-17 14:56:17.843	Active	beb38e67d6b96429b6867a8858e50afdf34d9c3d5c292b50a40957813722cb36	Original System Log
\.


--
-- Data for Name: audit_log_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log_tbl (log_id, user_id, action_type, table_name, record_id, details, ip_address, "timestamp", pdl_id) FROM stdin;
1	11	CREATE_PDL	pdl_tbl	1	{"rfid": "1260703026", "status": "Sentenced", "message": "Initial registration and profiling completed.", "fullname": "Juan  Dela Cruz"}	10.203.191.234	2026-04-09 13:10:52.316305	1
2	11	CREATE_PDL	pdl_tbl	2	{"rfid": "1258930626", "status": "Sentenced", "message": "Initial registration and profiling completed.", "fullname": "Ricardo Ramos"}	10.203.191.234	2026-04-09 13:13:38.052448	2
3	11	CREATE_PDL	pdl_tbl	3	{"rfid": "1258909026", "status": "Sentenced", "message": "Initial registration and profiling completed.", "fullname": "Maria Clara Ibarra"}	10.203.191.234	2026-04-09 13:16:09.384474	3
4	11	CREATE_PDL	pdl_tbl	4	{"rfid": "1259272738", "status": "Sentenced", "message": "Initial registration and profiling completed.", "fullname": "Antonio Luna"}	10.203.191.234	2026-04-09 13:18:00.985751	4
5	11	CREATE_PDL	pdl_tbl	5	{"rfid": "1260818178", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Fernando Poe"}	10.203.191.234	2026-04-09 13:19:10.812412	5
6	11	CREATE_PDL	pdl_tbl	6	{"rfid": "1258433266", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Elena Adarna"}	10.203.191.234	2026-04-09 13:20:18.308238	6
7	11	CREATE_PDL	pdl_tbl	7	{"rfid": "1260075634", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Roberto  Gomez"}	10.203.191.234	2026-04-09 13:21:33.708643	7
8	11	CREATE_PDL	pdl_tbl	8	{"rfid": "1259899170", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Angela Torres"}	10.203.191.234	2026-04-09 13:22:39.414136	8
9	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:33:15.692863	\N
10	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-06", "unlocked_count": 0, "affected_pdl_ids": [1, 2, 3, 4, 5, 6, 7, 8], "credits_granted_to": 8}	192.168.100.161	2026-04-09 14:33:16.03431	\N
11	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:33:42.837852	\N
12	11	MSEC_VOID_CREDITS	multiple_credit_logs	6	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-07.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-07"}	192.168.100.161	2026-04-09 14:36:17.63445	6
13	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:36:23.057076	\N
14	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:37:11.121624	\N
15	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:37:17.519593	\N
16	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-03", "unlocked_count": 0, "affected_pdl_ids": [1, 2, 3, 4, 5, 6, 7, 8], "credits_granted_to": 8}	192.168.100.161	2026-04-09 14:38:15.482549	\N
17	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:38:35.623744	\N
18	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	16	{"message": "Manual re-seal for GCTA", "new_hash": "940ce6e565...", "reference": "Standard Day for Gcta", "correction": "30 -> 20 days"}	192.168.100.161	2026-04-09 14:39:15.322443	8
19	11	START_PROGRAM_SESSION	session_tbl	191	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 191, "program_name": "Education", "session_date": "2026-04-09", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.100.161	2026-04-09 14:41:33.212857	\N
20	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:43:57.425314	\N
21	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [1, 3, 4, 8], "message": "Automated TASTM sync completed.", "affected_count": 4}	192.168.100.161	2026-04-09 14:43:57.827604	\N
22	11	FINALIZE_PROGRAM_SESSION	session_tbl	191	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 191, "program_name": "Education", "session_date": "2026-04-09", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 4}	192.168.100.161	2026-04-09 14:43:59.172023	\N
23	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	191	{"after": {"pdl_id": 1, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/9/2026 2:45:46 PM", "row_hash": "bab92675d319e994519bece6c9b2d319d457e88232549280e65dfe81d930832e", "session_id": 191, "timestamp_in": "2026-04-09T06:45:46.667Z", "attendance_id": 3, "hours_attended": "2.00"}, "before": {"pdl_id": 1, "status": "Active", "remarks": "Original System Log", "row_hash": "98f3a2f3b3e8cc595071b5d06d4f444229c03e62fe58a88f5ff8a5840ce81bac", "session_id": 191, "timestamp_in": "2026-04-09T06:42:17.652Z", "attendance_id": 3, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "2.00", "old_hours": "2.00", "remark_added": " | MANUALLY ADJUSTED: 4/9/2026 2:45:46 PM", "integrity_seal": "bab92675..."}	192.168.100.161	2026-04-09 14:45:46.66525	1
24	11	SYSTEM_MAINTENANCE_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_MAINTENANCE access.", "attempted_by": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:46:20.412753	\N
25	11	SYSTEM_MAINTENANCE_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_MAINTENANCE access.", "attempted_by": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:46:23.698696	\N
26	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.100.161	2026-04-09 14:46:29.71514	\N
54	11	INTEGRITY_REPAIR	attendance_tbl	6	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "cdbc22a9...", "corrected_hours": "2.00", "paper_log_reference": "asdas"}	192.168.254.106	2026-04-13 22:05:55.412662	6
55	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:49:17.0335	\N
27	11	RELEASE_PDL	released_tbl	4	{"message": "PDL officially released. History archived and profile reset.", "fullname": "Antonio Luna", "final_snapshot": {"gender": "", "pdl_id": 4, "birthday": "1982-10-29", "last_name": "Luna", "created_at": "2026-04-09T05:18:00.985Z", "crime_name": "Physical Injury", "first_name": "Antonio", "pdl_status": "Sentenced", "updated_at": "2026-04-09T06:50:03.359Z", "case_number": "04", "middle_name": "Novicio", "pdl_picture": null, "rfid_number": "1259272738", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2021-06-05", "date_admitted_bjmp": "2021-07-13", "is_locked_for_gcta": false, "expected_releasedate": "2023-04-25", "original_release_date": "2023-06-04", "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 40}, "actual_release_date": "2026-01-05", "total_credits_applied": 40}	192.168.100.161	2026-04-09 14:50:55.33789	4
28	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 7}	192.168.100.161	2026-04-09 14:54:49.60734	\N
29	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 7}	192.168.100.161	2026-04-09 14:54:58.942316	\N
30	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:55:30.663769	\N
31	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:56:02.752609	\N
32	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:58:02.526811	\N
33	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:58:26.698886	\N
34	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.100.161	2026-04-09 14:59:11.359535	\N
35	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.100.161	2026-04-09 15:08:44.615406	\N
36	11	START_PROGRAM_SESSION	session_tbl	192	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 192, "program_name": "Education", "session_date": "2026-04-09", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.100.161	2026-04-09 15:16:48.942239	\N
37	11	CANCEL_PROGRAM_SESSION	session_tbl	192	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 192, "program_name": "Education", "session_date": "2026-04-09", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 1}	192.168.100.161	2026-04-09 15:22:33.254458	\N
38	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.106	2026-04-13 21:43:54.611591	\N
39	11	INTEGRITY_AUDIT_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for INTEGRITY_AUDIT access.", "attempted_by": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:44:00.512301	\N
40	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:44:03.211129	\N
41	11	START_PROGRAM_SESSION	session_tbl	193	{"message": "Initialized new session for Education: sdas", "session_data": {"session_id": 193, "program_name": "Education", "session_date": "2026-04-13", "session_name": "sdas", "hours_to_earn": "2.00", "officer_in_charge": "test"}, "hours_granted": "2", "officer_assigned": "test"}	192.168.254.106	2026-04-13 21:45:59.007881	\N
42	11	START_PROGRAM_SESSION	session_tbl	194	{"message": "Initialized new session for Education: sdas", "session_data": {"session_id": 194, "program_name": "Education", "session_date": "2026-04-13", "session_name": "sdas", "hours_to_earn": "2.00", "officer_in_charge": "test"}, "hours_granted": "2", "officer_assigned": "test"}	192.168.254.106	2026-04-13 21:45:59.161568	\N
43	11	FINALIZE_PROGRAM_SESSION	session_tbl	194	{"message": "Warden finalized session: sdas", "program_name": "Education", "original_data": {"session_id": 194, "program_name": "Education", "session_date": "2026-04-13", "session_name": "sdas", "hours_to_earn": "2.00", "officer_in_charge": "test"}, "attendee_count": 1}	192.168.254.106	2026-04-13 21:46:22.492602	\N
44	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:46:51.727913	\N
45	11	INTEGRITY_REPAIR	attendance_tbl	6	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "9b8c00f2...", "corrected_hours": "2.00", "paper_log_reference": "Page 45"}	192.168.254.106	2026-04-13 21:46:59.966173	6
46	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:48:30.639527	\N
47	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:51:10.652228	\N
48	11	INTEGRITY_REPAIR	attendance_tbl	6	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "3ff3e982...", "corrected_hours": "2.00", "paper_log_reference": "dsda"}	192.168.254.106	2026-04-13 21:51:17.530792	6
49	11	INTEGRITY_REPAIR	attendance_tbl	6	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "a3dbc24a...", "corrected_hours": "5.00", "paper_log_reference": "sadasd"}	192.168.254.106	2026-04-13 21:53:42.935338	6
50	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:57:52.267484	\N
51	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 21:58:21.377804	\N
52	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 22:01:00.459993	\N
53	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.106	2026-04-13 22:01:51.478717	\N
56	13	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [6], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.1.41	2026-04-17 10:49:17.399438	\N
57	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:49:29.750817	\N
58	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:50:28.512088	\N
59	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:50:46.434282	\N
60	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:52:42.58174	\N
61	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:53:55.811673	\N
62	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.1.41	2026-04-17 10:59:32.948166	\N
63	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.1.41	2026-04-17 11:07:53.37904	\N
64	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.1.41	2026-04-17 11:10:55.214145	\N
65	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	16	{"message": "Manual re-seal for GCTA", "new_hash": "940ce6e565...", "reference": "sdasd", "correction": "23 -> 20 days"}	192.168.1.41	2026-04-17 11:10:59.629582	8
66	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	194	{"after": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM", "row_hash": "e19c3a2bcb25ba80cec304a792d886680775ef7adc05293484f70fdd38e3b800", "session_id": 194, "timestamp_in": "2026-04-17T03:15:16.966Z", "attendance_id": 6, "hours_attended": "0.50"}, "before": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas]", "row_hash": "cdbc22a93ef0910acb91a965e3088fd8dc3b9a33d3dff6aeca4b93338ba8ecd3", "session_id": 194, "timestamp_in": "2026-04-13T14:05:55.413Z", "attendance_id": 6, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "0.50", "old_hours": "2.00", "remark_added": " | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM", "integrity_seal": "e19c3a2b..."}	192.168.1.41	2026-04-17 11:15:16.966903	6
67	11	CREATE_PDL	pdl_tbl	9	{"rfid": "1258909026", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "sadasd asdasd"}	192.168.1.41	2026-04-17 11:31:42.627968	9
68	11	RELEASE_PDL	released_tbl	9	{"message": "PDL officially released. History archived and profile reset.", "fullname": "sadasd asdasd", "final_snapshot": {"gender": "Female", "pdl_id": 9, "birthday": "2000-02-02", "last_name": "asdasd", "created_at": "2026-04-17T03:31:42.627Z", "crime_name": "asdasd", "first_name": "sadasd", "pdl_status": "Detained", "updated_at": "2026-04-17T03:33:52.925Z", "case_number": "asd", "middle_name": "sadas", "pdl_picture": "pdl-1776396702620-403539766.jpg", "rfid_number": "1258909026", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-12-12", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "actual_release_date": "2026-01-03", "total_credits_applied": 0}	192.168.1.41	2026-04-17 11:35:22.780717	9
69	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [6], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.1.41	2026-04-17 11:57:45.516212	\N
70	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	194	{"after": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM | MANUALLY ADJUSTED: 4/17/2026 12:00:33 PM", "row_hash": "adbba8412b92a325e99959600f18dde1094e40cbad2a948148738cde1f196661", "session_id": 194, "timestamp_in": "2026-04-17T04:00:33.094Z", "attendance_id": 6, "hours_attended": "2.00"}, "before": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM", "row_hash": "e19c3a2bcb25ba80cec304a792d886680775ef7adc05293484f70fdd38e3b800", "session_id": 194, "timestamp_in": "2026-04-17T03:15:16.966Z", "attendance_id": 6, "hours_attended": "0.50"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "2.00", "old_hours": "0.50", "remark_added": " | MANUALLY ADJUSTED: 4/17/2026 12:00:33 PM", "integrity_seal": "adbba841..."}	192.168.1.41	2026-04-17 12:00:33.092852	6
71	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	194	{"after": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM | MANUALLY ADJUSTED: 4/17/2026 12:00:33 PM | MANUALLY ADJUSTED: 4/17/2026 12:00:57 PM", "row_hash": "a1baeae8e7fc287b0769368aa0d0f6902bf8f74c883c8565a3a3b3d0a63e10be", "session_id": 194, "timestamp_in": "2026-04-17T04:00:57.803Z", "attendance_id": 6, "hours_attended": "4.00"}, "before": {"pdl_id": 6, "status": "Active", "remarks": "REPAIRED: Verified via Paper Log [Ref: asdas] | MANUALLY ADJUSTED: 4/17/2026 11:15:16 AM | MANUALLY ADJUSTED: 4/17/2026 12:00:33 PM", "row_hash": "adbba8412b92a325e99959600f18dde1094e40cbad2a948148738cde1f196661", "session_id": 194, "timestamp_in": "2026-04-17T04:00:33.094Z", "attendance_id": 6, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "4.00", "old_hours": "2.00", "remark_added": " | MANUALLY ADJUSTED: 4/17/2026 12:00:57 PM", "integrity_seal": "a1baeae8..."}	192.168.1.41	2026-04-17 12:00:57.802058	6
72	11	START_PROGRAM_SESSION	session_tbl	195	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 195, "program_name": "Education", "session_date": "2026-04-17", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.1.41	2026-04-17 12:15:49.766986	\N
73	11	FINALIZE_PROGRAM_SESSION	session_tbl	195	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 195, "program_name": "Education", "session_date": "2026-04-17", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 3}	192.168.1.41	2026-04-17 12:16:18.053436	\N
74	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [2, 6, 1], "message": "Automated TASTM sync completed.", "affected_count": 3}	192.168.1.41	2026-04-17 12:19:37.880878	\N
75	11	START_PROGRAM_SESSION	session_tbl	196	{"message": "Initialized new session for Education: sdasd", "session_data": {"session_id": 196, "program_name": "Education", "session_date": "2026-04-17", "session_name": "sdasd", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.1.41	2026-04-17 12:49:47.799949	\N
76	11	CANCEL_PROGRAM_SESSION	session_tbl	196	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"sdasd\\" was discarded.", "deleted_snapshot": {"session_id": 196, "program_name": "Education", "session_date": "2026-04-17", "session_name": "sdasd", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.1.41	2026-04-17 12:49:51.435592	\N
77	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "tastm", "total_records": 1}	192.168.1.41	2026-04-17 13:42:32.562404	\N
78	11	START_PROGRAM_SESSION	session_tbl	197	{"message": "Initialized new session for Education: sadasd", "session_data": {"session_id": 197, "program_name": "Education", "session_date": "2026-04-17", "session_name": "sadasd", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.1.41	2026-04-17 13:44:19.334817	\N
79	11	CANCEL_PROGRAM_SESSION	session_tbl	197	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"sadasd\\" was discarded.", "deleted_snapshot": {"session_id": 197, "program_name": "Education", "session_date": "2026-04-17", "session_name": "sadasd", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.1.41	2026-04-17 13:44:20.664227	\N
80	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 6}	192.168.1.41	2026-04-17 13:48:45.675932	\N
81	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:06:22.727013	\N
82	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 7}	192.168.1.41	2026-04-17 14:11:48.690978	\N
83	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 7}	192.168.1.41	2026-04-17 14:11:59.561171	\N
84	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "tastm", "total_records": 1}	192.168.1.41	2026-04-17 14:12:44.565524	\N
85	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "tastm", "total_records": 1}	192.168.1.41	2026-04-17 14:13:08.829312	\N
86	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:13:15.427938	\N
87	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:13:27.677499	\N
88	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "release", "total_records": 1}	192.168.1.41	2026-04-17 14:14:13.161167	\N
89	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "release", "total_records": 1}	192.168.1.41	2026-04-17 14:14:17.068453	\N
90	11	MSEC_VOID_CREDITS	multiple_credit_logs	6	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.1.41	2026-04-17 14:16:41.365198	6
91	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.1.41	2026-04-17 14:23:46.83619	\N
92	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:45:40.454757	\N
93	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:52:11.506491	\N
94	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:54:31.017243	\N
95	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:54:33.837187	\N
96	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "attendance", "total_records": 5}	192.168.1.41	2026-04-17 14:54:58.677606	\N
97	11	START_PROGRAM_SESSION	session_tbl	198	{"message": "Initialized new session for Vocational: CSS", "session_data": {"session_id": 198, "program_name": "Vocational", "session_date": "2026-04-17", "session_name": "CSS", "hours_to_earn": "3.00", "officer_in_charge": "Mark"}, "hours_granted": "3", "officer_assigned": "Mark"}	192.168.1.41	2026-04-17 14:56:13.839374	\N
98	11	FINALIZE_PROGRAM_SESSION	session_tbl	198	{"message": "Warden finalized session: CSS", "program_name": "Vocational", "original_data": {"session_id": 198, "program_name": "Vocational", "session_date": "2026-04-17", "session_name": "CSS", "hours_to_earn": "3.00", "officer_in_charge": "Mark"}, "attendee_count": 1}	192.168.1.41	2026-04-17 14:56:19.665077	\N
99	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.1.41	2026-04-17 15:04:20.945281	\N
100	11	SYSTEM_MAINTENANCE_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_MAINTENANCE access.", "attempted_by": "Admin Aguigam"}	192.168.1.41	2026-04-17 15:09:30.561338	\N
101	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.1.41	2026-04-17 15:09:33.937212	\N
\.


--
-- Data for Name: gcta_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gcta_days_log (gcta_log_id, pdl_id, month_year, days_earned, date_granted, status, remarks, row_hash) FROM stdin;
1	1	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	b869c1ebe9fbc688db3d26c09d9958d66ad5e680dd1e0861f76adfcdc96d2468
2	2	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	b895b8234cd04694554fd3b55bf5fbbb522a72f2acf1ec3f72cbd19a197c3d5b
3	3	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	8a1913cde909f3913c6a265ccdef413191bbad3f44ebae6e1ab460b51276276f
5	5	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	b729f69fe3aded7fecb6fa4dad56f84183cfebd00670a3b7b20cb99be4f7a039
7	7	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	d4adca0ed69a50239441adb9f9d2efa3e5e98147c2d4b2df4b673e56c08d66b8
6	6	2026-07-01	20	2026-07-01 00:00:00	Voided	MSEC DQ: GCTA Voided for 2026-07	d32cf8338740061bcd2f150772ad424f403e523ae530885ec3cd0c875b8234d6
8	8	2026-07-01	30	2026-07-01 00:00:00	Active	Automated GCTA	41a87bb49648ead30ebb499c7f553edb849e331e92b22d8102acceba4131d6d9
9	1	2026-04-01	20	2026-04-09 14:38:15.482	Active	Automated GCTA	7c01b45cb0c997ac0c1e7836b8ae695fe01e35887658a11e1df9f97fd334c4e8
10	2	2026-04-01	20	2026-04-09 14:38:15.482	Active	Automated GCTA	d2c146c0ffba33bfbcb4b8aaec3a814df75b868325bf861e2c9480787d13b7b7
11	3	2026-04-01	20	2026-04-09 14:38:15.482	Active	Automated GCTA	48403004f62a00e8ffc0cf9815fb854c47978b74de366b871c9aceae2259a398
13	5	2026-04-01	20	2026-04-09 14:38:15.482	Active	Automated GCTA	4b3b4bab41057d5f46af21723611a56aa9df2223f2acb68ef86a9754334f9ffa
15	7	2026-04-01	20	2026-04-09 14:38:15.482	Active	Automated GCTA	67d9b7ccf1e8ab31b923be4e9c25fb40ed3f9138798136061a94b1fc32f05957
4	4	2026-07-01	20	2026-07-01 00:00:00	Released	Automated GCTA	5ac4f438e4fe9e3631418d459a195141637e65c43dfaa8f41ce555803c3e2913
12	4	2026-04-01	20	2026-04-09 14:38:15.482	Released	Automated GCTA	db5328c83f6f8bd55dab2aec893c4bd2691fcb6d7a9bda0345584e1709d61dc9
16	8	2026-04-01	20	2026-04-17 11:10:59.629582	Active	Automated GCTA (REPAIRED: Ref [sdasd])	940ce6e565ada003d7310753296c3301d96d0abffa3c410753b9320ee26ccfa5
14	6	2026-04-01	20	2026-04-09 14:38:15.482	Voided	MSEC DQ: GCTA Voided for 2026-04	a75e99944aa2f081b0760b4be7bf0c5251a872aca2171f6353fac31aef1a69a9
\.


--
-- Data for Name: incident_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_tbl (incident_id, pdl_id, incident_date, category, penalty_end_date, remarks, status) FROM stdin;
\.


--
-- Data for Name: moduletbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.moduletbl (moduleid, modulename, moduledescription) FROM stdin;
5	User Management	Create and manage system accounts
1	PDL & RFID Management	Register PDLs and assign RFID tags
2	Attendance & Sessions	Manage classes and scan attendance
3	Conduct & Penalties	Log violations that affect GCTA eligibility
4	Time Allowance Computation (GCTA/TASTM)	Automated calculation of sentence reductions based on RA 10592
\.


--
-- Data for Name: pdl_subsidiary_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pdl_subsidiary_tbl (subsidiary_id, pdl_id, total_fine_amount, amount_paid, daily_rate, max_subsidiary_days, judgment_date, status, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pdl_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pdl_tbl (pdl_id, first_name, middle_name, last_name, gender, birthday, pdl_status, date_commited_pnp, date_admitted_bjmp, sentence_years, sentence_months, sentence_days, original_release_date, expected_releasedate, rfid_number, pdl_picture, is_locked_for_gcta, total_timeallowance_earned, case_number, crime_name, created_at, updated_at, is_legally_disqualified, disqualification_reason, date_of_final_judgment) FROM stdin;
2	Ricardo	Santos	Ramos		1998-05-15	Sentenced	2025-01-15	2025-02-15	1	5	0	2026-06-15	2026-05-05	1258930626	\N	f	40	02	Theft	2026-04-09 13:13:38.052448	2026-04-09 13:13:38.052448	f	\N	\N
6	Elena	Cruz	Adarna	Female	1999-11-30	Detained	\N	2016-06-26	0	0	0	\N	1969-12-11	1258433266	\N	f	20	06	Drugs	2026-04-09 13:20:18.308238	2026-04-09 13:20:18.308238	f	\N	\N
4	Antonio	Novicio	Luna		1982-10-29	Released	\N	\N	0	0	0	\N	\N	\N	\N	f	0	04	Physical Injury	2026-04-09 13:18:00.985751	2026-04-09 14:50:55.33789	f	\N	\N
7	Roberto 	Reyes	Gomez		1985-12-12	Detained	\N	2012-05-22	0	0	0	\N	\N	1260075634	\N	f	40	07	Homicide	2026-04-09 13:21:33.708643	2026-04-17 11:02:22.353778	f	\N	\N
1	Juan 	Galang	Dela Cruz		2000-01-12	Sentenced	2026-02-28	2026-03-01	2	1	0	2028-03-28	2028-02-16	1260703027	\N	f	40	123132	Robbery	2026-04-09 13:10:52.316305	2026-04-09 13:10:52.316305	f	\N	\N
3	Maria Clara	Mercado	Ibarra	Female	1995-08-22	Sentenced	2020-05-04	2020-06-05	2	6	0	2022-11-04	2022-09-24	1260703026	\N	f	40	03	ESTAFA	2026-04-09 13:16:09.384474	2026-04-09 13:16:09.384474	f	\N	\N
9	sadasd	sadas	asdasd	Female	2000-02-02	Released	\N	\N	0	0	0	\N	\N	\N	pdl-1776396702620-403539766.jpg	f	0	asd	asdasd	2026-04-17 11:31:42.627968	2026-04-17 11:35:22.780717	f	\N	\N
8	Angela	Dizon	Torres	Female	2001-01-01	Detained	\N	2019-06-26	0	0	0	\N	\N	1259899170	\N	f	30	08	Shoplifting	2026-04-09 13:22:39.414136	2026-04-17 11:47:16.767553	f	\N	\N
5	Fernando	Garcia	Poe		1975-02-15	Detained	\N	2015-04-25	0	0	0	\N	\N	1260818178	\N	f	40	05	Gambling	2026-04-09 13:19:10.812412	2026-04-17 14:14:38.126551	f	\N	\N
\.


--
-- Data for Name: released_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.released_tbl (release_id, pdl_id, first_name, last_name, middle_name, birthday, gender, crime_name, sentence_years, sentence_months, sentence_days, total_credits_applied, date_commited_pnp, actual_release_date, remarks, date_admitted_bjmp, is_legally_disqualified, date_of_final_judgment) FROM stdin;
1	4	Antonio	Luna	Novicio	1982-10-29		Physical Injury	2	0	0	40	2021-06-05	2026-01-05	\N	2021-07-13	f	\N
2	9	sadasd	asdasd	sadas	2000-02-02	Female	asdasd	0	0	0	0	\N	2026-01-03	\N	2025-12-12	f	\N
\.


--
-- Data for Name: rolepermissiontable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rolepermissiontable (rolepermissionid, roleid, moduleid, canview, cancreate, canedit, candelete, canapprove) FROM stdin;
21	1	1	t	t	t	t	t
22	1	2	t	t	t	t	t
23	1	3	t	t	t	t	t
24	1	4	t	t	t	t	t
25	1	5	t	t	t	t	t
33	3	3	t	t	f	f	f
35	3	5	f	f	f	f	f
29	2	4	t	f	f	f	t
27	2	2	t	f	f	f	t
32	3	2	t	t	t	f	f
34	3	4	t	f	f	f	f
31	3	1	t	t	f	f	f
30	2	5	t	f	f	f	f
26	2	1	t	f	t	f	f
28	2	3	t	t	t	f	f
\.


--
-- Data for Name: roletbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roletbl (roleid, rolename, roledescription) FROM stdin;
1	Admin	System Administrator - Manages users and system settings
2	Warden	Approving Authority - Can manage PDLs and approve enrollments
3	Jail Officer	Encoder - Manages PDL records, reports incidents, requests enrollment
\.


--
-- Data for Name: session_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session_tbl (session_id, program_name, session_name, hours_to_earn, session_date, officer_in_charge) FROM stdin;
113	Alternative Learning System	ALS Workshop - Day 1	8.00	2026-03-16	Warden Tech Support
114	Alternative Learning System	ALS Workshop - Day 2	8.00	2026-03-17	Warden Tech Support
115	Alternative Learning System	ALS Workshop - Day 3	8.00	2026-03-18	Warden Tech Support
116	Alternative Learning System	ALS Workshop - Day 4	8.00	2026-03-19	Warden Tech Support
117	Alternative Learning System	ALS Workshop - Day 5	8.00	2026-03-20	Warden Tech Support
118	Education	ALS Exam	3.00	2026-03-23	Mark JO1
121	Education	12	2.00	2026-04-03	asd
123	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
124	Education	Test	2.00	2026-04-05	Mark JO1/ Rod JO1
127	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
128	Education	ALS Exam	2.00	2026-04-05	2
129	Education	Test	2.00	2026-04-05	2
130	Education	s	2.00	2026-04-05	s
131	Education	ssdadsa	2.00	2026-04-05	Mark JO1/ Rod JO1
133	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
135	Education	Test	2.00	2026-04-05	2
138	Education	ALS Exam	3.00	2026-04-05	Mark JO1/ Rod JO1
139	Education	Test	5.00	2026-04-05	Mark JO1/ Rod JO1
140	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
141	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
142	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
143	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
146	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
147	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
148	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
149	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
150	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
151	Education	ALS Exam	5.00	2026-04-05	Mark JO1/ Rod JO1
152	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
153	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
154	Education	ALS Exam	2.00	2026-04-05	Mark JO1/ Rod JO1
156	Education	2	2.00	2026-04-05	2
157	Education	asda	2.00	2026-04-05	Mark JO1/ Rod JO1
144	Education	sdasd	2.00	2026-04-05	Mark JO1/ Rod JO1
160	Education	ALS Exam	2.00	2026-04-06	2
161	Education	asdasd	2.00	2026-04-06	sda
164	Education	asdas	1.00	2026-04-06	Mark JO1/ Rod JO1
168	Education	asda	2.00	2026-04-08	sdasdas
169	Education	asdas	2.00	2026-04-08	Mark JO1/ Rod JO1
170	Education	asdas	2.00	2026-04-08	asdasd
171	Education	asdas	2.00	2026-04-08	Mark JO1/ Rod JO1
172	Education	asdsad	2.00	2026-04-08	asdasdas
173	Education	asdas	2.00	2026-04-08	Mark JO1/ Rod JO1
175	Education	wawawa	2.00	2026-04-08	sadasd
178	Education	cancel to tol	2.00	2026-04-08	asdas
181	Education	litaw to tol	2.00	2026-04-08	asd
186	Education	asdaw112312312	2.00	2026-04-08	asdas
188	Education	attendance ngayon	2.00	2026-04-08	asdas
190	Education	sdasdas	2.00	2026-04-09	dasdasd
191	Education	ALS Exam	2.00	2026-04-09	Mark JO1/ Rod JO1
193	Education	sdas	2.00	2026-04-13	test
194	Education	sdas	2.00	2026-04-13	test
195	Education	ALS Exam	2.00	2026-04-17	Mark JO1/ Rod JO1
198	Vocational	CSS	3.00	2026-04-17	Mark
\.


--
-- Data for Name: tastm_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tastm_days_log (tastm_log_id, pdl_id, month_year, total_hours_accumulated, days_earned, date_granted, remarks, status, row_hash) FROM stdin;
2	3	2026-04-01	2.00	0	2026-04-09 14:43:57.827604	Automated TASTM	Active	2b692648c407b4df8ba673e45b5bcd122d546f699bd884b2c2566d345754d338
4	8	2026-04-01	2.00	0	2026-04-09 14:43:57.827604	Automated TASTM	Active	0b5c80274b2ba0e904503c2191dfe6de5f0927598b0ed6a6b2786ab48b14a0e1
3	4	2026-04-01	2.00	0	2026-04-09 14:43:57.827604	Automated TASTM	Released	d111fc08426488184113ba2e9bd48dfef5574cb682929e55ae139ebb9c79484f
5	6	2026-04-01	6.00	0	2026-04-17 12:19:37.880878	Automated TASTM	Active	890d08ec2855553ca0c7ccea6d5ae6d55526684c9ed221dc9eff6835d0109425
1	1	2026-04-01	4.00	0	2026-04-17 12:19:37.880878	Automated TASTM	Active	83e2e070978dbf427d0028b1e7554b6df3526aca68643069392d8549db163614
6	2	2026-04-01	2.00	0	2026-04-17 12:19:37.880878	Automated TASTM	Active	9383e8a53d97c70baa3ac8d1d63c89ad90e5f79ebad6be096e9e488fe963486b
7	2	2026-04-01	2.00	15	2026-04-17 12:19:37.880878	Automated TASTM	Active	9383e8a53d97c70baa3ac8d1d63c89ad90e5f79ebad6be096e9e488fe963486b
\.


--
-- Data for Name: usertbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usertbl (userid, username, password, fullname, roleid, status) FROM stdin;
12	boygaming17	$2b$10$v1bbI8xuFc6o7/xEHmK6T.rWva5aM6iA8KtJFcZBRBzjA5u28ZT7G	Rod To	3	Active
15	asd123	$2b$10$72ki4rDK0P8ggkqGwuISculLVpa/x84B6yhuLzj2egtQ9zGf2Sdvy	Rod To1	2	Active
16	asdaa	$2b$10$Gyvxk7UBAtvtPCz81bq44O/Mn9Z9dzEQqw/CBc7YwzhZkY1onSk4W	aasdas	3	Active
17	aploloftw	$2b$10$ebcg70UikefKmJnNLm1B3OUyKXFAg3hu/SwQrEVAbKxqDh6LiUSOq	dasdsad	1	Active
19	q2133	$2b$10$AHf9/aBY1ueI5pD1kZVU5eHznqsBprxjOy4GJOOnsjEj0rAh4dbXm	q2133	1	Active
18	tttt	$2b$10$RTXn42/Qd3X0l7yRU/.j3.FbBMx0xlMG2GIk9APK/HRcT/55jwH9e	Rod To2	2	Active
11	super_admin	$2b$10$pa2s/JG8hGMrRAwp1k1Q8O7hOpCXPTOI1QkuRmTUfdOgTNgUhJAP6	Admin Aguigam	1	Active
10	warden_test	$2b$10$X2uK4YT8t6JNi38rYn/MNeaWjdBw7IwzUcD0vWiTP24Exmj78fa8S	Warden Smith	2	Active
14	qqqq	$2b$10$T3JmTw60MmiHHFc2NyPAxeqt53gTTxUOROvSDI.zWnjiKSrlJ82X2	Mark Lising	3	Active
9	jundlcrz	$2b$10$wo6uys90arKc9L9cYFHSEOBcrHUVWvhypkgv87ElWoe3H99bQJOJC	Juan Dela Cruz	3	Active
13	warden_to	$2b$10$/6FEFwmOp95gldeo8mCW1u9ZZtQJ2R5ICZeuQ3ut2t4H5MbDz7LK2	Rian To	2	Active
\.


--
-- Name: attendance_tbl_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_tbl_attendance_id_seq', 10, true);


--
-- Name: audit_log_tbl_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_tbl_log_id_seq', 101, true);


--
-- Name: gcta_days_log_gcta_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gcta_days_log_gcta_log_id_seq', 16, true);


--
-- Name: incident_tbl_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_tbl_incident_id_seq', 1, false);


--
-- Name: moduletbl_moduleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.moduletbl_moduleid_seq', 5, true);


--
-- Name: pdl_subsidiary_tbl_subsidiary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pdl_subsidiary_tbl_subsidiary_id_seq', 1, false);


--
-- Name: pdl_tbl_pdl_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pdl_tbl_pdl_id_seq', 9, true);


--
-- Name: released_tbl_release_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.released_tbl_release_id_seq', 2, true);


--
-- Name: rolepermissiontable_rolepermissionid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rolepermissiontable_rolepermissionid_seq', 35, true);


--
-- Name: roletbl_roleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roletbl_roleid_seq', 7, true);


--
-- Name: session_tbl_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.session_tbl_session_id_seq', 198, true);


--
-- Name: tastm_days_log_tastm_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tastm_days_log_tastm_log_id_seq', 7, true);


--
-- Name: usertbl_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usertbl_userid_seq', 19, true);


--
-- Name: attendance_tbl attendance_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_tbl
    ADD CONSTRAINT attendance_tbl_pkey PRIMARY KEY (attendance_id);


--
-- Name: audit_log_tbl audit_log_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_tbl
    ADD CONSTRAINT audit_log_tbl_pkey PRIMARY KEY (log_id);


--
-- Name: gcta_days_log gcta_days_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gcta_days_log
    ADD CONSTRAINT gcta_days_log_pkey PRIMARY KEY (gcta_log_id);


--
-- Name: incident_tbl incident_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_tbl
    ADD CONSTRAINT incident_tbl_pkey PRIMARY KEY (incident_id);


--
-- Name: moduletbl moduletbl_modulename_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moduletbl
    ADD CONSTRAINT moduletbl_modulename_key UNIQUE (modulename);


--
-- Name: moduletbl moduletbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moduletbl
    ADD CONSTRAINT moduletbl_pkey PRIMARY KEY (moduleid);


--
-- Name: pdl_subsidiary_tbl pdl_subsidiary_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_subsidiary_tbl
    ADD CONSTRAINT pdl_subsidiary_tbl_pkey PRIMARY KEY (subsidiary_id);


--
-- Name: pdl_tbl pdl_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_tbl
    ADD CONSTRAINT pdl_tbl_pkey PRIMARY KEY (pdl_id);


--
-- Name: pdl_tbl pdl_tbl_rfid_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_tbl
    ADD CONSTRAINT pdl_tbl_rfid_number_key UNIQUE (rfid_number);


--
-- Name: released_tbl released_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.released_tbl
    ADD CONSTRAINT released_tbl_pkey PRIMARY KEY (release_id);


--
-- Name: rolepermissiontable rolepermissiontable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermissiontable
    ADD CONSTRAINT rolepermissiontable_pkey PRIMARY KEY (rolepermissionid);


--
-- Name: roletbl roletbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roletbl
    ADD CONSTRAINT roletbl_pkey PRIMARY KEY (roleid);


--
-- Name: roletbl roletbl_rolename_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roletbl
    ADD CONSTRAINT roletbl_rolename_key UNIQUE (rolename);


--
-- Name: session_tbl session_tbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_tbl
    ADD CONSTRAINT session_tbl_pkey PRIMARY KEY (session_id);


--
-- Name: tastm_days_log tastm_days_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tastm_days_log
    ADD CONSTRAINT tastm_days_log_pkey PRIMARY KEY (tastm_log_id);


--
-- Name: usertbl usertbl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertbl
    ADD CONSTRAINT usertbl_pkey PRIMARY KEY (userid);


--
-- Name: usertbl usertbl_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertbl
    ADD CONSTRAINT usertbl_username_key UNIQUE (username);


--
-- Name: idx_audit_pdl_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_pdl_id ON public.audit_log_tbl USING btree (pdl_id);


--
-- Name: idx_audit_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_timestamp ON public.audit_log_tbl USING btree ("timestamp" DESC);


--
-- Name: idx_audit_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user_id ON public.audit_log_tbl USING btree (user_id);


--
-- Name: attendance_tbl attendance_tbl_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_tbl
    ADD CONSTRAINT attendance_tbl_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id) ON DELETE CASCADE;


--
-- Name: attendance_tbl attendance_tbl_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_tbl
    ADD CONSTRAINT attendance_tbl_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session_tbl(session_id) ON DELETE CASCADE;


--
-- Name: audit_log_tbl audit_log_tbl_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_tbl
    ADD CONSTRAINT audit_log_tbl_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id);


--
-- Name: pdl_subsidiary_tbl fk_pdl_subsidiary; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdl_subsidiary_tbl
    ADD CONSTRAINT fk_pdl_subsidiary FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id) ON DELETE CASCADE;


--
-- Name: gcta_days_log gcta_days_log_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gcta_days_log
    ADD CONSTRAINT gcta_days_log_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id) ON DELETE CASCADE;


--
-- Name: incident_tbl incident_tbl_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incident_tbl
    ADD CONSTRAINT incident_tbl_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id) ON DELETE CASCADE;


--
-- Name: released_tbl released_tbl_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.released_tbl
    ADD CONSTRAINT released_tbl_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id);


--
-- Name: rolepermissiontable rolepermissiontable_moduleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermissiontable
    ADD CONSTRAINT rolepermissiontable_moduleid_fkey FOREIGN KEY (moduleid) REFERENCES public.moduletbl(moduleid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rolepermissiontable rolepermissiontable_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rolepermissiontable
    ADD CONSTRAINT rolepermissiontable_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roletbl(roleid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tastm_days_log tastm_days_log_pdl_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tastm_days_log
    ADD CONSTRAINT tastm_days_log_pdl_id_fkey FOREIGN KEY (pdl_id) REFERENCES public.pdl_tbl(pdl_id) ON DELETE CASCADE;


--
-- Name: usertbl usertbl_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertbl
    ADD CONSTRAINT usertbl_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roletbl(roleid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 2fuuQY37PiBrsjdf2aGjZcGnwd9Sqlq5A6hdocatnmScP725zUruQB4WTbq2vWQ

