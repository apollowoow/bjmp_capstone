--
-- PostgreSQL database dump
--

\restrict xPGKcox7Tef1pHrYQN6n3ofMleY9b6BYkO0KEycwRXEHgdBSIh0psGXrOf3RS5Y

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
1	18	199	2.00	2026-04-18 00:41:39.46	Active	fcf861598b4926c5edf2ad6e80f931e864216acfb21052251fa5a5c66946cd4b	Original System Log
2	17	199	2.00	2026-04-18 00:41:42.625	Active	0dcfaff0bb06c146414a7f80083e491b78f3e4ab86e8b9c6dd57ec5965e52cb9	Original System Log
3	14	199	2.00	2026-04-18 00:41:48.968	Active	3d7f3070bccdc07bfb1d204c1634f282cb2df5938cdc906c34f2aa7fdbe660aa	Original System Log
\.


--
-- Data for Name: audit_log_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log_tbl (log_id, user_id, action_type, table_name, record_id, details, ip_address, "timestamp", pdl_id) FROM stdin;
1	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:43:17.962248	\N
2	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:44:23.712216	\N
3	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:49:55.839259	\N
4	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:51:08.916978	\N
5	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian Matthew Aguigam", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:51:27.453771	\N
6	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Rod Justin Encina", "session_expiry": "8h"}	192.168.1.41	2026-04-17 23:52:31.935135	\N
7	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.61	2026-04-18 00:08:42.323116	\N
8	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.60	2026-04-18 00:11:16.394541	\N
9	11	CREATE_PDL	pdl_tbl	10	{"rfid": "1258433266", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Angela Torres"}	192.168.1.60	2026-04-18 00:14:50.423293	10
10	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-03", "unlocked_count": 0, "affected_pdl_ids": [10], "credits_granted_to": 1}	192.168.1.61	2026-04-18 00:14:57.830899	\N
11	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian Matthew Aguigam", "session_expiry": "8h"}	192.168.1.41	2026-04-18 00:15:32.698512	\N
12	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian Matthew Aguigam", "session_expiry": "8h"}	192.168.1.41	2026-04-18 00:15:56.371186	\N
13	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Rod Justin Encina", "session_expiry": "8h"}	192.168.1.41	2026-04-18 00:16:25.935748	\N
14	11	CREATE_PDL	pdl_tbl	11	{"rfid": "1259899170", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Jose Manalo"}	192.168.1.60	2026-04-18 00:19:49.886	11
15	11	CREATE_PDL	pdl_tbl	12	{"rfid": "1258930626", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Maria Ibarra"}	192.168.1.60	2026-04-18 00:21:39.443	12
16	11	CREATE_PDL	pdl_tbl	13	{"rfid": "1260703026", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Juan Dela Cruz"}	192.168.1.60	2026-04-18 00:23:31.77736	13
17	11	CREATE_PDL	pdl_tbl	14	{"rfid": "1260818178", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Elen Adarna"}	192.168.1.60	2026-04-18 00:26:01.07086	14
18	11	CREATE_PDL	pdl_tbl	15	{"rfid": "1259582546", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Fernando Poe"}	192.168.1.60	2026-04-18 00:27:27.737239	15
19	11	CREATE_PDL	pdl_tbl	16	{"rfid": "1259272738", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Max Gonzales"}	192.168.1.60	2026-04-18 00:28:58.573229	16
20	11	CREATE_PDL	pdl_tbl	17	{"rfid": "1260075634", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Roberto Gomez"}	192.168.1.60	2026-04-18 00:30:24.744919	17
21	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-18 00:31:37.933184	\N
22	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-03", "unlocked_count": 0, "affected_pdl_ids": [11, 12, 13, 14, 15, 16, 17], "credits_granted_to": 7}	192.168.1.41	2026-04-18 00:31:38.172225	\N
23	11	INTEGRITY_AUDIT_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for INTEGRITY_AUDIT access.", "attempted_by": "Mark Lising"}	192.168.1.41	2026-04-18 00:32:03.8501	\N
24	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Mark Lising"}	192.168.1.41	2026-04-18 00:32:06.169635	\N
25	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Mark Lising"}	192.168.1.41	2026-04-18 00:32:11.866461	\N
26	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.1.41	2026-04-18 00:34:16.434763	\N
27	11	CREATE_PDL	pdl_tbl	18	{"rfid": "1258909026", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Daniel Padilla"}	192.168.1.41	2026-04-18 00:37:05.572597	18
28	11	UPDATE_PERSONAL_INFO	pdl_tbl	18	{"after": {"gender": "Male", "pdl_id": 18, "birthday": "2000-02-02", "last_name": "Padilla", "created_at": "2026-04-17T16:37:05.572Z", "crime_name": "Robbery", "first_name": "Daniel", "pdl_status": "Detained", "updated_at": "2026-04-17T16:39:45.231Z", "case_number": "123", "middle_name": "Garcia", "pdl_picture": "pdl-1776443825567-109419217.jpg", "rfid_number": "1258909026", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-08-08", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "before": {"gender": "Male", "pdl_id": 18, "birthday": "2000-02-02", "last_name": "Padilla", "created_at": "2026-04-17T16:37:05.572Z", "crime_name": "Theft", "first_name": "Daniel", "pdl_status": "Detained", "updated_at": "2026-04-17T16:37:08.614Z", "case_number": "123", "middle_name": "Garcia", "pdl_picture": "pdl-1776443825567-109419217.jpg", "rfid_number": "1258909026", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-08-08", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Updated personal information for Daniel Padilla", "photo_updated": false}	192.168.1.41	2026-04-18 00:39:45.231764	18
29	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-03", "unlocked_count": 0, "affected_pdl_ids": [18], "credits_granted_to": 1}	192.168.1.41	2026-04-18 00:40:05.20066	\N
30	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	18	{"after": {"gender": "Male", "pdl_id": 18, "birthday": "2000-02-02", "last_name": "Padilla", "created_at": "2026-04-17T16:37:05.572Z", "crime_name": "Robbery", "first_name": "Daniel", "pdl_status": "Sentenced", "updated_at": "2026-04-17T16:40:55.466Z", "case_number": "123", "middle_name": "Garcia", "pdl_picture": "pdl-1776443825567-109419217.jpg", "rfid_number": "1258909026", "sentence_days": 0, "sentence_years": 0, "sentence_months": 8, "date_commited_pnp": "2025-07-07", "date_admitted_bjmp": "2025-08-08", "is_locked_for_gcta": false, "expected_releasedate": "2026-02-14", "original_release_date": "2026-03-06", "date_of_final_judgment": "2026-01-01", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "before": {"gender": "Male", "pdl_id": 18, "birthday": "2000-02-02", "last_name": "Padilla", "created_at": "2026-04-17T16:37:05.572Z", "crime_name": "Robbery", "first_name": "Daniel", "pdl_status": "Detained", "updated_at": "2026-04-17T16:40:09.136Z", "case_number": "123", "middle_name": "Garcia", "pdl_picture": "pdl-1776443825567-109419217.jpg", "rfid_number": "1258909026", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-08-08", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 18, "remarks": "", "birthday": "2000-02-02", "gcta_days": 0, "last_name": "Padilla", "created_at": "2026-04-17T16:37:05.572Z", "crime_name": "Robbery", "daily_rate": 1000, "first_name": "Daniel", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-17T16:40:09.136Z", "amount_paid": 0, "case_number": "123", "hasMigrated": false, "middle_name": "Garcia", "pdl_picture": "http://192.168.1.41:5000/public/uploads/pdl-1776443825567-109419217.jpg", "rfid_number": "1258909026", "tastm_hours": 0, "gcta_history": [{"pdl_id": 18, "status": "Active", "remarks": "Automated GCTA", "row_hash": "f8dc44a27ea7f832e08d7c6eca4becc6a66d6492d9df00e1d93940579df1cfe5", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 9, "date_granted": "2026-04-17T16:40:05.199Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "active_penalty": null, "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 8, "isManualOverride": true, "date_commited_pnp": "2025-07-07", "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-08-08", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-01-01", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.1.41	2026-04-18 00:40:55.466353	18
31	11	START_PROGRAM_SESSION	session_tbl	199	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 199, "program_name": "Education", "session_date": "2026-04-17", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1"}	192.168.1.41	2026-04-18 00:41:33.762521	\N
32	11	FINALIZE_PROGRAM_SESSION	session_tbl	199	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 199, "program_name": "Education", "session_date": "2026-04-17", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1"}, "attendee_count": 3}	192.168.1.41	2026-04-18 00:41:53.172699	\N
33	11	RECORD_DISCIPLINARY_INCIDENT	incident_tbl	14	{"message": "Incident recorded: Less Serious. Penalty stacked. New End Date: 2026-07-17", "remarks": "Involved in a fist fight.", "category": "Less Serious", "penalty_ends": "2026-07-17T00:00:00.000Z", "incident_date": "2026-04-17", "system_impact": "GCTA eligibility suspended"}	192.168.1.41	2026-04-18 00:43:36.250805	14
34	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [18, 17], "message": "Automated TASTM sync completed.", "affected_count": 2}	192.168.1.41	2026-04-18 00:43:40.952255	\N
35	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 9}	192.168.1.41	2026-04-18 00:44:07.114323	\N
36	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 1}	192.168.1.41	2026-04-18 00:44:22.046633	\N
37	11	ADMIN_RESET_PASSWORD	usertbl	11	{"note": "Security credentials overridden by Admin.", "message": "Administrative password reset for super_admin"}	192.168.1.41	2026-04-18 00:44:52.993076	\N
38	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Mark Lising"}	192.168.1.41	2026-04-18 00:45:53.897139	\N
39	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	9	{"message": "Manual re-seal for GCTA", "new_hash": "f8dc44a27e...", "reference": "Page 45", "correction": "25 -> 20 days"}	192.168.1.41	2026-04-18 00:46:06.413013	18
40	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Mark Lising"}	192.168.1.41	2026-04-18 00:46:30.425441	\N
41	11	SYSTEM_MAINTENANCE_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_MAINTENANCE access.", "attempted_by": "Mark Lising"}	192.168.1.41	2026-04-18 00:47:55.369626	\N
42	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Mark Lising"}	192.168.1.41	2026-04-18 00:47:58.584013	\N
\.


--
-- Data for Name: gcta_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gcta_days_log (gcta_log_id, pdl_id, month_year, days_earned, date_granted, status, remarks, row_hash) FROM stdin;
1	10	2026-04-01	20	2026-04-18 00:14:57.83	Active	Automated GCTA	19599b7dfc8437f2b64e75954615ed1e6326d05bc964ded63c30200460f8735e
2	11	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	0900c0ce53956fbe3fe8f04d6e4592d65b9762ca716b1cadd39c3865ec0ca371
3	12	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	0dccda22adc87d5a91809fcde2f8b0fa08f81b7d6d9ab820839199b2ea553baf
4	13	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	8db75c85b8a907c7a5cb8bfba440e0399ddf770fe9c498626365e7f6a5f59882
5	14	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	0dd50094c5fcb62ea207b68af6acd2309f877e0c9a32fe05581385ba76ab1457
6	15	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	e22e1fb5d13cd5378d858712972b1d212eaaf7b710212690c8a3f909c4a647cc
7	16	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	1434d1908684268c9bfd6c494b8a312d99138bfe6c4cdf39c6cd00dd079d52fd
8	17	2026-04-01	20	2026-04-18 00:31:38.175	Active	Automated GCTA	902fcf8b49fdc4dbbc67d35151df0585f6479275d7324952ee6fd6bf497626b1
9	18	2026-04-01	20	2026-04-18 00:46:06.413013	Active	Automated GCTA (REPAIRED: Ref [Page 45])	f8dc44a27ea7f832e08d7c6eca4becc6a66d6492d9df00e1d93940579df1cfe5
\.


--
-- Data for Name: incident_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_tbl (incident_id, pdl_id, incident_date, category, penalty_end_date, remarks, status) FROM stdin;
1	14	2026-04-17	Less Serious	2026-07-17	Involved in a fist fight.	Active
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
18	Daniel	Garcia	Padilla	Male	2000-02-02	Sentenced	2025-07-07	2025-08-08	0	8	0	2026-03-06	2026-02-14	1258909026	pdl-1776443825567-109419217.jpg	f	20	123	Robbery	2026-04-18 00:37:05.572597	2026-04-18 00:40:56.063944	f	\N	2026-01-01
14	Elen	Maria	Adarna	Female	1988-11-15	Detained	\N	2025-08-16	0	0	0	\N	\N	1260818178	pdl-1776443160971-202074157.webp	t	20	123	Theft	2026-04-18 00:26:01.07086	2026-04-18 00:32:40.713433	f	\N	\N
11	Jose	Ariel	Manalo	Male	1966-07-06	Detained	\N	2025-05-14	0	0	0	\N	\N	1259899170	pdl-1776442789739-949533752.jpg	f	20	123	Theft	2026-04-18 00:19:49.886	2026-04-18 00:45:26.719507	f	\N	\N
12	Maria	Clara	Ibarra	Female	1998-03-19	Detained	\N	2025-10-22	0	0	0	\N	1969-12-11	1258930626	pdl-1776442899407-291433041.jpg	f	20	1243	Robbery	2026-04-18 00:21:39.443	2026-04-18 00:21:39.443	f	\N	\N
13	Juan	Coco	Dela Cruz	Male	1997-01-28	Detained	\N	2025-01-28	0	0	0	\N	1969-12-11	1260703026	pdl-1776443011739-615551608.jpg	f	20	123	STAFA	2026-04-18 00:23:31.77736	2026-04-18 00:23:31.77736	f	\N	\N
17	Roberto	King	Gomez	Male	1962-11-08	Detained	\N	2025-05-06	0	0	0	\N	\N	1260075634	pdl-1776443424705-98770913.jpg	f	20	987	Rape	2026-04-18 00:30:24.744919	2026-04-18 00:32:26.709597	f	\N	\N
16	Max	Supremo	Gonzales	Male	1996-12-25	Detained	\N	2025-04-04	0	0	0	\N	\N	1259272738	pdl-1776443338376-934279009.webp	f	20	123	STAFA	2026-04-18 00:28:58.573229	2026-04-18 00:32:31.812997	f	\N	\N
15	Fernando	Lakas	Poe	Male	1946-07-11	Detained	\N	2025-02-05	0	0	0	\N	\N	1259582546	pdl-1776443247683-507393621.jpg	f	20	12345	Robbery	2026-04-18 00:27:27.737239	2026-04-18 00:32:33.967956	f	\N	\N
10	Angela	Dela Cruz	Torres	Female	1994-07-20	Detained	\N	2025-06-10	0	0	0	\N	\N	1258433266	pdl-1776442490383-188290342.webp	f	20	12345	Theft	2026-04-18 00:14:50.423293	2026-04-18 00:32:46.080347	f	\N	\N
\.


--
-- Data for Name: released_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.released_tbl (release_id, pdl_id, first_name, last_name, middle_name, birthday, gender, crime_name, sentence_years, sentence_months, sentence_days, total_credits_applied, date_commited_pnp, actual_release_date, remarks, date_admitted_bjmp, is_legally_disqualified, date_of_final_judgment) FROM stdin;
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
199	Education	ALS Exam	2.00	2026-04-17	Mark JO1
\.


--
-- Data for Name: tastm_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tastm_days_log (tastm_log_id, pdl_id, month_year, total_hours_accumulated, days_earned, date_granted, remarks, status, row_hash) FROM stdin;
8	18	2026-04-01	2.00	0	2026-04-18 00:43:40.952255	Automated TASTM	Active	5d98a8487a1e24a74cf2a944086a5897544644be0cd2f440064f904018f90b0c
9	17	2026-04-01	2.00	0	2026-04-18 00:43:40.952255	Automated TASTM	Active	a95790f9c037e8ffd9cb0310b64ed68339cd86366a8c9461acc93e4c1a1ea3f5
\.


--
-- Data for Name: usertbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usertbl (userid, username, password, fullname, roleid, status) FROM stdin;
13	warden_to	$2b$10$/6FEFwmOp95gldeo8mCW1u9ZZtQJ2R5ICZeuQ3ut2t4H5MbDz7LK2	Rian Matthew Aguigam	2	Active
14	qqqq	$2b$10$T3JmTw60MmiHHFc2NyPAxeqt53gTTxUOROvSDI.zWnjiKSrlJ82X2	Rod Justin Encina	3	Active
11	super_admin	$2b$10$3hru9umAU3bGC1aGunvT9uaC/pJcFm649ljkNibnkgrljGaVcYQAe	Mark Lising	1	Active
\.


--
-- Name: attendance_tbl_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_tbl_attendance_id_seq', 3, true);


--
-- Name: audit_log_tbl_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_tbl_log_id_seq', 42, true);


--
-- Name: gcta_days_log_gcta_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gcta_days_log_gcta_log_id_seq', 9, true);


--
-- Name: incident_tbl_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_tbl_incident_id_seq', 1, true);


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

SELECT pg_catalog.setval('public.pdl_tbl_pdl_id_seq', 18, true);


--
-- Name: released_tbl_release_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.released_tbl_release_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.session_tbl_session_id_seq', 199, true);


--
-- Name: tastm_days_log_tastm_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tastm_days_log_tastm_log_id_seq', 9, true);


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

\unrestrict xPGKcox7Tef1pHrYQN6n3ofMleY9b6BYkO0KEycwRXEHgdBSIh0psGXrOf3RS5Y

