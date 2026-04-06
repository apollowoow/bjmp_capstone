--
-- PostgreSQL database dump
--

\restrict orp1HSJiZZMlxeISPj2urKFthSlnfH7FJnQUNfgZgJuXC8wVgZIGYE9Ot9kcGFO

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
235	89	157	6.00	2026-04-06 01:15:31.845	Active	9cf57416b024bc52c3a21ae51d00d3c3c22438ebbf4022ff100112f0f968550f	Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM | MANUALLY ADJUSTED: 4/6/2026 1:12:38 AM | MANUALLY ADJUSTED: 4/6/2026 1:15:31 AM
238	89	160	2.00	2026-04-06 16:46:58.582	Active	552e2bd5dee7883ecc427e6cbb256f9de38630f4c5a7d3d8440b9b98a9064688	Original System Log
232	89	154	4.00	2026-04-06 01:50:39.396	Active	bdc9f3b1f23fdd7118556e9c43dbb4222306ec0ac4d3c6a5cca697ca88092a3f	 REPAIRED: Verified via Paper Log [Ref: xzc]
231	89	153	2.00	2026-04-06 13:08:33.237	Active	d8e3a1ca64435476fc3d484086f809f854cbaa6e99398053fc401512c1aa66f6	 REPAIRED: Verified via Paper Log [Ref: asdas]
223	81	144	3.00	2026-04-06 13:12:25.402	Active	0933be854e7ed51e12954de01a1ccc8e2eafa8b86c2911bb7f4e77910b8e42fc	REPAIRED: Verified via Paper Log [Ref: Page 45]
201	75	113	8.00	2026-05-01 08:00:00	Active	\N	
210	75	113	8.00	2026-05-01 08:00:00	Active	\N	
200	75	113	8.00	2026-04-01 08:00:00	Active	\N	
234	89	156	50.00	2026-04-06 13:26:09.151	Active	0b10c2d22290672aabcb7265c0b79b1a5b8d35186c164b84308aa736e983e8d2	 | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:35 PM | MANUALLY ADJUSTED: 4/6/2026 1:26:09 PM
202	75	113	8.00	2026-05-01 08:00:00	Active	\N	
203	75	113	8.00	2026-05-01 08:00:00	Active	\N	
204	75	113	8.00	2026-05-01 08:00:00	Active	\N	
205	74	113	8.00	2026-05-01 08:00:00	Active	\N	
206	74	113	8.00	2026-05-01 08:00:00	Active	\N	
207	74	113	8.00	2026-05-01 08:00:00	Active	\N	
208	74	121	8.00	2026-06-01 08:00:00	Active	\N	
211	76	123	5.00	2026-04-05 12:56:00.383976	Active	\N	
212	74	124	6.00	2026-04-05 13:30:33.078395	Active	\N	
215	74	133	2.00	2026-04-05 13:30:46.132023	Active	\N	
216	75	135	2.00	2026-04-05 15:27:26.030599	Active	\N	
217	77	138	3.00	2026-04-05 16:53:41.012292	Active	\N	
218	77	139	40.00	2026-04-05 16:55:46.517579	Active	\N	
219	77	140	2.00	2026-04-05 16:56:24.426688	Active	\N	
220	78	141	2.00	2026-04-05 16:59:57.803171	Active	\N	
221	78	142	2.00	2026-04-05 17:02:57.027565	Active	\N	
222	78	143	7.00	2026-04-05 17:21:24.000326	Active	\N	
224	83	146	2.00	2026-04-05 17:58:28.436934	Active	\N	
225	86	147	2.00	2026-04-05 18:22:48.00258	Active	\N	
226	86	148	2.00	2026-04-05 18:26:23.178134	Active	\N	
227	86	149	2.00	2026-04-05 19:33:40.841394	Active	\N	
228	87	150	2.00	2026-04-05 19:37:27.50257	Active	\N	
229	88	151	5.00	2026-04-05 19:45:51.252307	Active	\N	
230	88	152	60.00	2026-04-05 19:49:05.457151	Active	\N	
\.


--
-- Data for Name: audit_log_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log_tbl (log_id, user_id, action_type, table_name, record_id, details, ip_address, "timestamp", pdl_id) FROM stdin;
191	11	CREATE_PDL	pdl_tbl	76	{"rfid": "1231231239", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Mark Lising"}	192.168.56.1	2026-04-04 20:52:46.491333	76
192	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T03:49:54.110Z", "case_number": "123132", "middle_name": "asdsa", "pdl_picture": null, "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T03:49:45.888Z", "case_number": "123132", "middle_name": "asdsa", "pdl_picture": null, "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 76, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T03:49:45.888Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "asdsa", "pdl_picture": null, "rfid_number": "1231231239", "tastm_hours": 21, "gcta_history": [{"pdl_id": 76, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 400, "date_granted": "2026-04-03T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.56.1	2026-04-05 11:49:54.110336	76
193	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:02:32.466Z", "case_number": "123132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-09", "original_release_date": "2027-09-09", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T04:02:01.611Z", "case_number": "123132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 76, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T04:02:01.611Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "asdsa", "pdl_picture": "http://192.168.56.1:5000/public/uploads/pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "tastm_hours": 0, "gcta_history": [{"pdl_id": 76, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 400, "date_granted": "2026-04-03T16:00:00.000Z"}, {"pdl_id": 76, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 401, "date_granted": "2026-04-05T03:49:54.110Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 76, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T03:50:17.321Z", "tastm_log_id": 559, "total_hours_accumulated": "21.00"}, {"pdl_id": 76, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T03:49:54.110Z", "tastm_log_id": 558, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-10", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.56.1	2026-04-05 12:02:32.46652	76
194	11	CREATE_SUBSIDIARY	pdl_subsidiary_tbl	8	{"after": {"pdl_id": 76, "status": "Active", "remarks": null, "created_at": "2026-04-05T04:06:38.890Z", "daily_rate": "675.00", "updated_at": "2026-04-05T04:06:38.890Z", "amount_paid": "0.00", "judgment_date": null, "subsidiary_id": 8, "total_fine_amount": "5000.00", "max_subsidiary_days": 243}, "before": null, "message": "Created new subsidiary record.", "input_received": {"pdl_id": "76", "remarks": "", "daily_rate": "675", "judgment_date": "2026-04-05", "subsidiary_id": null, "total_fine_amount": "5000", "max_subsidiary_days": 243, "final_subsidiary_days": 7}}	192.168.56.1	2026-04-05 12:06:38.890408	76
195	11	UPDATE_SUBSIDIARY	pdl_subsidiary_tbl	8	{"after": {"pdl_id": 76, "status": "Active", "remarks": null, "created_at": "2026-04-05T04:06:38.890Z", "daily_rate": "675.00", "updated_at": "2026-04-05T04:07:00.869Z", "amount_paid": "0.00", "judgment_date": null, "subsidiary_id": 8, "total_fine_amount": "6000.00", "max_subsidiary_days": 243}, "before": {"pdl_id": 76, "status": "Active", "remarks": null, "created_at": "2026-04-05T04:06:38.890Z", "daily_rate": "675.00", "updated_at": "2026-04-05T04:06:38.890Z", "amount_paid": "0.00", "judgment_date": null, "subsidiary_id": 8, "total_fine_amount": "5000.00", "max_subsidiary_days": 243}, "message": "Updated subsidiary fine details.", "input_received": {"pdl_id": "76", "remarks": "", "daily_rate": "675.00", "judgment_date": "2026-04-05", "subsidiary_id": 8, "total_fine_amount": "6000.00", "max_subsidiary_days": 243, "final_subsidiary_days": 8}}	192.168.56.1	2026-04-05 12:07:00.869966	76
196	11	UPDATE_PERSONAL_INFO	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:11:47.298Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:07:01.664Z", "case_number": "123132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Updated personal information for Mark Lising", "photo_updated": false}	192.168.56.1	2026-04-05 12:11:47.298059	76
216	11	START_PROGRAM_SESSION	session_tbl	132	{"message": "Initialized new session for Education: reload1", "session_data": {"session_id": 132, "program_name": "Education", "session_date": "2026-04-05", "session_name": "reload1", "hours_to_earn": "2.00", "officer_in_charge": "as"}, "hours_granted": "2", "officer_assigned": "as"}	192.168.56.1	2026-04-05 13:02:57.191546	\N
217	11	RELOAD_DISCARD_SESSION	session_tbl	132	{"message": "Session \\"reload1\\" was discarded via page reload/reset.", "deleted_snapshot": {"session_id": 132, "program_name": "Education", "session_date": "2026-04-05", "session_name": "reload1", "hours_to_earn": "2.00", "officer_in_charge": "as"}, "attendance_records_removed": 0}	192.168.56.1	2026-04-05 13:02:59.173645	\N
219	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [76, 75], "credits_granted_to": 2}	192.168.56.1	2026-04-05 13:10:12.899538	\N
256	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:33:51.570514	\N
197	11	UPDATE_PERSONAL_INFO	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:11:51.345Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:11:47.873Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Updated personal information for Mark Lising", "photo_updated": false}	192.168.56.1	2026-04-05 12:11:51.345465	76
198	11	UPDATE_PERSONAL_INFO	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:12:04.465Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775362324449-841516641.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:11:52.317Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775361365432-238990350.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Updated personal information for Mark Lising", "photo_updated": true}	192.168.56.1	2026-04-05 12:12:04.465435	76
199	11	RECOMMIT_PDL	pdl_tbl	69	{"after": {"gender": "", "pdl_id": 69, "birthday": "2005-10-10", "last_name": "Nakulangan", "created_at": "2026-03-29T15:40:34.811Z", "crime_name": "Theft", "first_name": "Donny", "pdl_status": "Detained", "updated_at": "2026-04-05T04:23:22.164Z", "case_number": "123", "middle_name": "Tino", "pdl_picture": "pdl-1774798834666-152652011.png", "rfid_number": "1231231223", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2026-01-11", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "before": {"gender": "", "pdl_id": 69, "birthday": "2005-10-10", "last_name": "Nakulangan", "created_at": "2026-03-29T15:40:34.811Z", "crime_name": "Murder", "first_name": "Donny", "pdl_status": "Released", "updated_at": "2026-04-05T04:22:11.421Z", "case_number": "CA-10-007", "middle_name": "Tino", "pdl_picture": "pdl-1774798834666-152652011.png", "rfid_number": null, "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": null, "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "PDL Re-entered facility. Previous release history archived.", "recommit_case": "123", "previous_status": "Released"}	192.168.56.1	2026-04-05 12:23:22.16402	69
200	11	RELEASE_PDL	released_tbl	70	{"message": "PDL officially released. History archived and profile reset.", "fullname": "Dingdong Ravanera", "final_snapshot": {"gender": "", "pdl_id": 70, "birthday": "2000-10-10", "last_name": "Ravanera", "created_at": "2026-03-29T16:00:42.364Z", "crime_name": "Theft", "first_name": "Dingdong", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:25:21.837Z", "case_number": "CA-10-003", "middle_name": "Tino", "pdl_picture": "pdl-1774800042327-552045047.png", "rfid_number": "1259582542", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-10-30", "original_release_date": "2028-02-09", "date_of_final_judgment": "2026-02-10", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 102}, "actual_release_date": "2026-04-05", "total_credits_applied": 102}	192.168.56.1	2026-04-05 12:25:33.526549	70
218	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "unlocked_count": 0, "credits_granted_to": 1}	192.168.56.1	2026-04-05 13:08:02.709081	\N
327	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:20:34.587594	\N
328	11	MSEC_VOID_CREDITS	multiple_credit_logs	78	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 17:20:54.517951	78
329	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	143	{"after": {"pdl_id": 78, "status": "Active", "session_id": 143, "timestamp_in": "2026-04-05T09:21:24.000Z", "attendance_id": 222, "hours_attended": "7.00"}, "before": {"pdl_id": 78, "status": "Active", "session_id": 143, "timestamp_in": "2026-04-05T09:03:25.140Z", "attendance_id": 222, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "7.00", "old_hours": "2.00"}	192.168.254.128	2026-04-05 17:21:24.000326	78
201	11	UPDATE_PERSONAL_INFO	pdl_tbl	76	{"after": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:27:35.110Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775363255107-193255126.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 76, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-04T12:52:46.491Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T04:27:29.411Z", "case_number": "11132", "middle_name": "asdsa", "pdl_picture": "pdl-1775362324449-841516641.png", "rfid_number": "1231231239", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-10", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-17", "original_release_date": "2027-09-17", "date_of_final_judgment": "2026-05-04", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Updated personal information for Mark Lising", "photo_updated": true}	192.168.56.1	2026-04-05 12:27:35.110545	76
202	11	START_PROGRAM_SESSION	session_tbl	123	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 123, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 12:44:29.964677	\N
203	11	START_PROGRAM_SESSION	session_tbl	124	{"message": "Initialized new session for Education: Test", "session_data": {"session_id": 124, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 12:46:05.990646	\N
204	11	FINALIZE_PROGRAM_SESSION	session_tbl	124	{"message": "Warden finalized session: Test", "program_name": "Education", "original_data": {"session_id": 124, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.56.1	2026-04-05 12:48:25.064861	\N
205	11	START_PROGRAM_SESSION	session_tbl	125	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 125, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 12:51:04.716202	\N
206	11	CANCEL_PROGRAM_SESSION	session_tbl	125	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 125, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 1}	192.168.56.1	2026-04-05 12:51:16.95388	\N
207	11	START_PROGRAM_SESSION	session_tbl	126	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 126, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 12:52:42.285226	\N
208	11	REMOVE_ATTENDEE	attendance_tbl	126	{"reason": "Incorrect RFID tap / Manual correction", "message": "PDL was removed from session attendance.", "deleted_record": {"pdl_id": 74, "status": "Active", "session_id": 126, "timestamp_in": "2026-04-05T04:52:47.100Z", "attendance_id": 214, "hours_attended": "2.00"}}	192.168.56.1	2026-04-05 12:52:52.281327	74
209	11	CANCEL_PROGRAM_SESSION	session_tbl	126	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 126, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.56.1	2026-04-05 12:53:10.904548	\N
210	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	123	{"after": {"pdl_id": 76, "status": "Active", "session_id": 123, "timestamp_in": "2026-04-05T04:56:00.383Z", "attendance_id": 211, "hours_attended": "5.00"}, "before": {"pdl_id": 76, "status": "Active", "session_id": 123, "timestamp_in": "2026-04-05T04:44:34.816Z", "attendance_id": 211, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "5.00", "old_hours": "2.00"}	192.168.56.1	2026-04-05 12:56:00.383976	76
211	11	START_PROGRAM_SESSION	session_tbl	127	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 127, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 12:58:02.946862	\N
212	11	START_PROGRAM_SESSION	session_tbl	128	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 128, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.56.1	2026-04-05 12:58:34.268608	\N
213	11	START_PROGRAM_SESSION	session_tbl	129	{"message": "Initialized new session for Education: Test", "session_data": {"session_id": 129, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.56.1	2026-04-05 12:59:14.872528	\N
214	11	START_PROGRAM_SESSION	session_tbl	130	{"message": "Initialized new session for Education: s", "session_data": {"session_id": 130, "program_name": "Education", "session_date": "2026-04-05", "session_name": "s", "hours_to_earn": "2.00", "officer_in_charge": "s"}, "hours_granted": "2", "officer_assigned": "s"}	192.168.56.1	2026-04-05 13:00:19.672264	\N
215	11	START_PROGRAM_SESSION	session_tbl	131	{"message": "Initialized new session for Education: ssdadsa", "session_data": {"session_id": 131, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ssdadsa", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 13:01:29.104922	\N
226	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	124	{"after": {"pdl_id": 74, "status": "Active", "session_id": 124, "timestamp_in": "2026-04-05T05:29:49.496Z", "attendance_id": 212, "hours_attended": "6.00"}, "before": {"pdl_id": 74, "status": "Active", "session_id": 124, "timestamp_in": "2026-04-05T04:46:09.811Z", "attendance_id": 212, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "6.00", "old_hours": "2.00"}	192.168.56.1	2026-04-05 13:29:49.496629	74
227	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [74], "pdls_affected_count": 1}	192.168.56.1	2026-04-05 13:29:54.941627	\N
228	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	124	{"after": {"pdl_id": 74, "status": "Active", "session_id": 124, "timestamp_in": "2026-04-05T05:30:33.078Z", "attendance_id": 212, "hours_attended": "6.00"}, "before": {"pdl_id": 74, "status": "Active", "session_id": 124, "timestamp_in": "2026-04-05T05:29:49.496Z", "attendance_id": 212, "hours_attended": "6.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "6.00", "old_hours": "6.00"}	192.168.56.1	2026-04-05 13:30:33.078395	74
229	11	START_PROGRAM_SESSION	session_tbl	133	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 133, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 13:30:39.342237	\N
230	11	FINALIZE_PROGRAM_SESSION	session_tbl	133	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 133, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.56.1	2026-04-05 13:30:48.113875	\N
231	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [74], "pdls_affected_count": 1}	192.168.56.1	2026-04-05 13:30:55.149305	\N
232	11	MSEC_VOID_CREDITS	multiple_credit_logs	71	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.56.1	2026-04-05 13:32:57.38117	71
233	11	MSEC_RESTORE_CREDITS	multiple_credit_logs	71	{"reason": "MSEC Appeal/Review Approval", "message": "MSEC officially RESTORED GCTA credits for the period of 2026-04.", "status_change": "Voided -> Active", "month_affected": "2026-04", "target_restored": "GCTA"}	192.168.56.1	2026-04-05 13:34:19.866002	71
234	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 7}	192.168.56.1	2026-04-05 13:43:24.092214	\N
235	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 7}	192.168.56.1	2026-04-05 13:43:48.491911	\N
236	11	RECORD_DISCIPLINARY_INCIDENT	incident_tbl	76	{"message": "Incident recorded: Less Serious. PDL GCTA status set to LOCKED.", "remarks": "asdsa", "category": "Less Serious", "penalty_ends": "2026-07-05", "incident_date": "2026-04-05", "system_impact": "GCTA eligibility suspended"}	192.168.56.1	2026-04-05 13:46:45.594085	76
237	11	CREATE_USER	usertbl	19	{"message": "New system user created: q2133", "full_name": "q2133", "account_status": "Active", "assigned_role_id": 1}	192.168.56.1	2026-04-05 13:48:28.381906	\N
238	19	USER_LOGIN	usertbl	19	{"role": "Admin", "message": "User logged in successfully.", "fullname": "q2133", "session_expiry": "8h"}	192.168.56.1	2026-04-05 13:50:10.054579	\N
239	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.56.1	2026-04-05 13:59:25.989842	\N
240	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:00:10.189782	\N
241	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:03:02.673739	\N
242	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:09:55.700765	\N
243	11	UPDATE_USER_STATUS	usertbl	18	{"message": "Admin changed status for tttt", "new_status": "Inactive", "target_name": "Rod To2"}	192.168.56.1	2026-04-05 14:11:29.376239	\N
244	11	UPDATE_USER_STATUS	usertbl	18	{"message": "Admin changed status for tttt", "new_status": "Active", "target_name": "Rod To2"}	192.168.56.1	2026-04-05 14:11:37.809034	\N
245	11	UPDATE_USER_STATUS	usertbl	14	{"message": "Admin changed status for qqqq", "new_status": "Inactive", "target_name": "Mark Lising"}	192.168.56.1	2026-04-05 14:11:51.342839	\N
246	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:12:07.262042	\N
247	11	ADMIN_RESET_PASSWORD	usertbl	11	{"note": "Credentials overridden by Admin.", "message": "Administrative password reset for super_admin"}	192.168.56.1	2026-04-05 14:12:24.208449	\N
248	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:12:31.811209	\N
249	11	ADMIN_RESET_PASSWORD	usertbl	13	{"note": "Credentials overridden by Admin.", "message": "Administrative password reset for warden_to"}	192.168.56.1	2026-04-05 14:15:48.821764	\N
250	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:15:57.858993	\N
251	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:17:33.437239	\N
252	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:27:13.214402	\N
253	11	UPDATE_USER_STATUS	usertbl	9	{"message": "Admin changed status for jundlcrz", "new_status": "Inactive", "target_name": "Juan Dela Cruz"}	192.168.56.1	2026-04-05 14:27:43.321105	\N
254	11	ADMIN_RESET_PASSWORD	usertbl	10	{"note": "Security credentials overridden by Admin.", "message": "Administrative password reset for warden_test"}	192.168.56.1	2026-04-05 14:27:56.509049	\N
255	11	ADMIN_RESET_PASSWORD	usertbl	9	{"note": "Security credentials overridden by Admin.", "message": "Administrative password reset for jundlcrz"}	192.168.56.1	2026-04-05 14:28:19.214308	\N
257	11	UPDATE_USER_STATUS	usertbl	14	{"message": "Admin changed status for qqqq", "new_status": "Active", "target_name": "Mark Lising"}	192.168.56.1	2026-04-05 14:34:01.650419	\N
258	11	ADMIN_RESET_PASSWORD	usertbl	14	{"note": "Security credentials overridden by Admin.", "message": "Administrative password reset for qqqq"}	192.168.56.1	2026-04-05 14:34:07.716247	\N
259	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:34:13.957205	\N
260	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:34:25.521889	\N
261	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:42:00.640751	\N
262	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 14:50:16.873519	\N
263	11	UPDATE_USER_STATUS	usertbl	9	{"message": "Status change for jundlcrz", "new_data": {"status": "Active"}, "old_data": {"status": "Inactive"}}	192.168.56.1	2026-04-05 14:50:22.711701	\N
264	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [75], "credits_granted_to": 1}	192.168.56.1	2026-04-05 15:06:16.753975	\N
265	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:19:02.158572	\N
266	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:19:19.557448	\N
267	11	START_PROGRAM_SESSION	session_tbl	134	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 134, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.56.1	2026-04-05 15:19:46.992986	\N
268	11	CANCEL_PROGRAM_SESSION	session_tbl	134	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 134, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.56.1	2026-04-05 15:19:48.928485	\N
269	11	START_PROGRAM_SESSION	session_tbl	135	{"message": "Initialized new session for Education: Test", "session_data": {"session_id": 135, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.56.1	2026-04-05 15:27:11.040077	\N
270	11	START_PROGRAM_SESSION	session_tbl	136	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 136, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.56.1	2026-04-05 15:28:05.666044	\N
271	11	CANCEL_PROGRAM_SESSION	session_tbl	136	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 136, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendance_records_deleted": 0}	192.168.56.1	2026-04-05 15:28:14.06523	\N
272	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [75], "pdls_affected_count": 1}	192.168.56.1	2026-04-05 15:30:20.521062	\N
273	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 7}	192.168.56.1	2026-04-05 15:34:28.376464	\N
274	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 7}	192.168.56.1	2026-04-05 15:34:31.136888	\N
275	11	RECORD_DISCIPLINARY_INCIDENT	incident_tbl	75	{"message": "Incident recorded: Less Serious. PDL GCTA status set to LOCKED.", "remarks": "asdas", "category": "Less Serious", "penalty_ends": "2026-07-05", "incident_date": "2026-04-05", "system_impact": "GCTA eligibility suspended"}	192.168.56.1	2026-04-05 15:35:13.742347	75
276	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:43:05.624529	\N
277	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:43:39.314296	\N
278	11	ADMIN_RESET_PASSWORD	usertbl	13	{"note": "Security credentials overridden by Admin.", "message": "Administrative password reset for warden_to"}	192.168.56.1	2026-04-05 15:43:49.488922	\N
279	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:43:57.649793	\N
280	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:44:44.610783	\N
281	11	UPDATE_USER_STATUS	usertbl	13	{"message": "Status change for warden_to", "new_data": {"status": "Inactive"}, "old_data": {"status": "Active"}}	192.168.56.1	2026-04-05 15:44:51.547394	\N
282	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:45:11.321794	\N
283	11	UPDATE_USER_STATUS	usertbl	13	{"message": "Status change for warden_to", "new_data": {"status": "Active"}, "old_data": {"status": "Inactive"}}	192.168.56.1	2026-04-05 15:45:15.007745	\N
284	13	USER_LOGIN	usertbl	13	{"role": "Warden", "message": "User logged in successfully.", "fullname": "Rian To", "session_expiry": "8h"}	192.168.56.1	2026-04-05 15:45:23.680385	\N
285	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-05 16:50:44.013944	\N
286	11	CREATE_PDL	pdl_tbl	77	{"rfid": "1112223331", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Rian Lising"}	192.168.254.128	2026-04-05 16:52:23.729023	77
287	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [77], "credits_granted_to": 1}	192.168.254.128	2026-04-05 16:52:34.817825	\N
288	11	START_PROGRAM_SESSION	session_tbl	137	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 137, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 16:53:01.848073	\N
289	11	CANCEL_PROGRAM_SESSION	session_tbl	137	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 137, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.254.128	2026-04-05 16:53:23.176619	\N
290	11	START_PROGRAM_SESSION	session_tbl	138	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 138, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "3.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "3", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 16:53:35.526063	\N
291	11	FINALIZE_PROGRAM_SESSION	session_tbl	138	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 138, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "3.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 16:53:44.157316	\N
292	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [77], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 16:53:46.433358	\N
293	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	77	{"after": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Detained", "updated_at": "2026-04-05T08:54:26.605Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Detained", "updated_at": "2026-04-05T08:53:48.904Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 77, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Rian", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T08:53:48.904Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "tastm_hours": 21, "gcta_history": [{"pdl_id": 77, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 406, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 77, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T08:53:46.433Z", "tastm_log_id": 560, "total_hours_accumulated": "3.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 16:54:26.605477	77
294	11	START_PROGRAM_SESSION	session_tbl	139	{"message": "Initialized new session for Education: Test", "session_data": {"session_id": 139, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "5.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "5", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 16:54:53.71091	\N
295	11	FINALIZE_PROGRAM_SESSION	session_tbl	139	{"message": "Warden finalized session: Test", "program_name": "Education", "original_data": {"session_id": 139, "program_name": "Education", "session_date": "2026-04-05", "session_name": "Test", "hours_to_earn": "5.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 16:55:03.113999	\N
296	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [77], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 16:55:23.516965	\N
297	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	139	{"after": {"pdl_id": 77, "status": "Active", "session_id": 139, "timestamp_in": "2026-04-05T08:55:46.517Z", "attendance_id": 218, "hours_attended": "40.00"}, "before": {"pdl_id": 77, "status": "Active", "session_id": 139, "timestamp_in": "2026-04-05T08:54:57.819Z", "attendance_id": 218, "hours_attended": "5.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "40.00", "old_hours": "5.00"}	192.168.254.128	2026-04-05 16:55:46.517579	77
298	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [77], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 16:55:58.068072	\N
299	11	START_PROGRAM_SESSION	session_tbl	140	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 140, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 16:56:18.520747	\N
300	11	FINALIZE_PROGRAM_SESSION	session_tbl	140	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 140, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 16:56:32.677505	\N
301	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [77], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 16:56:35.973833	\N
320	11	CREATE_SUBSIDIARY	pdl_subsidiary_tbl	9	{"after": {"pdl_id": 78, "status": "Active", "remarks": null, "created_at": "2026-04-05T09:09:35.743Z", "daily_rate": "678.00", "updated_at": "2026-04-05T09:09:35.743Z", "amount_paid": "0.00", "judgment_date": null, "subsidiary_id": 9, "total_fine_amount": "20000.00", "max_subsidiary_days": 243}, "before": null, "message": "Created new subsidiary record.", "input_received": {"pdl_id": "78", "remarks": "", "daily_rate": "678", "judgment_date": "2026-04-05", "subsidiary_id": null, "total_fine_amount": "20000", "max_subsidiary_days": 243, "final_subsidiary_days": 29}}	192.168.254.128	2026-04-05 17:09:35.743773	78
302	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	77	{"after": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Sentenced", "updated_at": "2026-04-05T08:57:52.966Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-06-23", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-05", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 77}, "before": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Detained", "updated_at": "2026-04-05T08:56:37.985Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 77}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 77, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Rian", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T08:56:37.985Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "tastm_hours": 0, "gcta_history": [{"pdl_id": 77, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 406, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 77, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 407, "date_granted": "2026-04-05T08:54:26.605Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 77, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T08:54:26.605Z", "tastm_log_id": 561, "total_hours_accumulated": "21.00"}, {"pdl_id": 77, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 15, "date_granted": "2026-04-05T08:56:35.973Z", "tastm_log_id": 560, "total_hours_accumulated": "66.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-04-05", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 77}}	192.168.254.128	2026-04-05 16:57:52.966962	77
303	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	77	{"after": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Sentenced", "updated_at": "2026-04-05T08:58:03.930Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-09-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-05", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 0}, "before": {"gender": "", "pdl_id": 77, "birthday": "2000-10-10", "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "first_name": "Rian", "pdl_status": "Sentenced", "updated_at": "2026-04-05T08:57:53.541Z", "case_number": "123132", "middle_name": "Brina", "pdl_picture": "pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-06-23", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-05", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 77}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 77, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Lising", "created_at": "2026-04-05T08:52:23.729Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Rian", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T08:57:53.541Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379143655-819888746.jpeg", "rfid_number": "1112223331", "tastm_hours": 21, "gcta_history": [{"pdl_id": 77, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 406, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 77, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 407, "date_granted": "2026-04-05T08:54:26.605Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 77, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 15, "date_granted": "2026-04-05T08:57:52.966Z", "tastm_log_id": 560, "total_hours_accumulated": "66.00"}, {"pdl_id": 77, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T08:54:26.605Z", "tastm_log_id": 561, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Sentenced", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": "2027-06-23", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-05", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 77}}	192.168.254.128	2026-04-05 16:58:03.930978	77
304	11	CREATE_PDL	pdl_tbl	78	{"rfid": "1112223332", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Kathry Encina"}	192.168.254.128	2026-04-05 16:59:12.172575	78
305	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 16:59:19.270236	\N
306	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [77], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 16:59:19.343908	\N
307	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	78	{"after": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Detained", "updated_at": "2026-04-05T08:59:29.724Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Detained", "updated_at": "2026-04-05T08:59:21.582Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 78, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathry", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T08:59:21.582Z", "amount_paid": 0, "case_number": "123", "hasMigrated": false, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "tastm_hours": 21, "gcta_history": [{"pdl_id": 78, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 408, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 16:59:29.724481	78
308	11	START_PROGRAM_SESSION	session_tbl	141	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 141, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 16:59:50.136652	\N
309	11	FINALIZE_PROGRAM_SESSION	session_tbl	141	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 141, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 17:00:00.266696	\N
310	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [78], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:00:01.816439	\N
323	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:12:14.704958	\N
324	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:13:55.042191	\N
325	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:19:37.424754	\N
326	11	MSEC_VOID_CREDITS	multiple_credit_logs	78	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 17:20:08.384796	78
311	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	78	{"after": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:01:21.622Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Detained", "updated_at": "2026-04-05T09:00:46.124Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 78, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathry", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:00:46.124Z", "amount_paid": 0, "case_number": "123", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "tastm_hours": 0, "gcta_history": [{"pdl_id": 78, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 408, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 78, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 409, "date_granted": "2026-04-05T08:59:29.724Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 78, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T09:00:01.816Z", "tastm_log_id": 563, "total_hours_accumulated": "23.00"}, {"pdl_id": 78, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T08:59:29.724Z", "tastm_log_id": 562, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:01:21.62254	78
312	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	78	{"after": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:01:32.058Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:01:22.307Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 78, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathry", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:01:22.307Z", "amount_paid": 0, "case_number": "123", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "tastm_hours": 21, "gcta_history": [{"pdl_id": 78, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 408, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 78, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 409, "date_granted": "2026-04-05T08:59:29.724Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 78, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T09:01:21.622Z", "tastm_log_id": 563, "total_hours_accumulated": "23.00"}, {"pdl_id": 78, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T08:59:29.724Z", "tastm_log_id": 562, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Sentenced", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:01:32.058436	78
313	11	START_PROGRAM_SESSION	session_tbl	142	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 142, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 17:02:53.112232	\N
314	11	FINALIZE_PROGRAM_SESSION	session_tbl	142	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 142, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 17:02:59.735214	\N
315	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [78], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:03:01.50661	\N
316	11	START_PROGRAM_SESSION	session_tbl	143	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 143, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 17:03:21.76849	\N
317	11	FINALIZE_PROGRAM_SESSION	session_tbl	143	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 143, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 17:03:27.18959	\N
318	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [78], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:03:29.217509	\N
319	11	UPDATE_PERSONAL_INFO	pdl_tbl	78	{"after": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:04:57.730Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379897681-907359385.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-12-29", "original_release_date": "2028-02-29", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 78, "birthday": "2000-10-10", "last_name": "Encina", "created_at": "2026-04-05T08:59:12.172Z", "crime_name": "Theft", "first_name": "Kathry", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:03:31.783Z", "case_number": "123", "middle_name": "Brina", "pdl_picture": "pdl-1775379552127-31401728.png", "rfid_number": "1112223332", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-12-29", "original_release_date": "2028-02-29", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "message": "Updated personal information for Kathry Encina", "photo_updated": true}	192.168.254.128	2026-04-05 17:04:57.730909	78
321	11	MSEC_VOID_CREDITS	multiple_credit_logs	78	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 17:10:12.921423	78
322	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [78], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:10:15.617415	\N
330	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [78], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:21:44.975076	\N
331	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "CSV", "period": "2026-04", "message": "User exported a CSV report.", "report_type": "conduct", "total_records": 9}	192.168.254.128	2026-04-05 17:24:02.870528	\N
332	11	GENERATE_REPORT	pdl_tbl	\N	{"format": "PDF", "period": "2026-04", "message": "User exported a PDF report.", "report_type": "conduct", "total_records": 9}	192.168.254.128	2026-04-05 17:24:21.751154	\N
333	11	CREATE_PDL	pdl_tbl	79	{"rfid": "1112223330", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Mark Brina"}	192.168.254.128	2026-04-05 17:30:51.909259	79
334	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [79], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:30:56.227216	\N
335	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	79	{"after": {"gender": "Male", "pdl_id": 79, "birthday": "2000-10-10", "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:31:04.140Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": "pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 79, "birthday": "2000-10-10", "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:30:58.361Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": "pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 79, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:30:58.361Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Sinamban", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "tastm_hours": 21, "gcta_history": [{"pdl_id": 79, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 415, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 17:31:04.140627	79
336	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	79	{"after": {"gender": "Male", "pdl_id": 79, "birthday": "2000-10-10", "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:32:23.740Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": "pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-09-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 0}, "before": {"gender": "Male", "pdl_id": 79, "birthday": "2000-10-10", "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:31:37.104Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": "pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 79, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Brina", "created_at": "2026-04-05T09:30:51.909Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:31:37.104Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Sinamban", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775381451734-183520882.png", "rfid_number": "1112223330", "tastm_hours": 0, "gcta_history": [{"pdl_id": 79, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 415, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 79, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 416, "date_granted": "2026-04-05T09:31:04.140Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 79, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:31:04.140Z", "tastm_log_id": 564, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:32:23.740818	79
337	11	CREATE_PDL	pdl_tbl	80	{"rfid": "1112223335", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Kathren Aguigam"}	192.168.254.128	2026-04-05 17:35:42.063995	80
338	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [80], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:35:59.828694	\N
339	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	80	{"after": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Detained", "updated_at": "2026-04-05T09:36:26.623Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Detained", "updated_at": "2026-04-05T09:36:03.687Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Female", "pdl_id": 80, "remarks": "", "birthday": "2000-02-02", "gcta_days": 21, "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathren", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:36:03.687Z", "amount_paid": 0, "case_number": "12312", "hasMigrated": false, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "tastm_hours": 21, "gcta_history": [{"pdl_id": 80, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 417, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 17:36:26.623793	80
351	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [82], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:54:56.28597	\N
352	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:54:56.335371	\N
447	11	START_PROGRAM_SESSION	session_tbl	154	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 154, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 20:12:41.046023	\N
448	11	FINALIZE_PROGRAM_SESSION	session_tbl	154	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 154, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 20:12:47.988016	\N
449	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 20:12:49.351552	\N
340	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	80	{"after": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:36:54.195Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Detained", "updated_at": "2026-04-05T09:36:27.129Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Female", "pdl_id": 80, "remarks": "", "birthday": "2000-02-02", "gcta_days": 0, "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathren", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:36:27.129Z", "amount_paid": 0, "case_number": "12312", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "tastm_hours": 0, "gcta_history": [{"pdl_id": 80, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 417, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 80, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 418, "date_granted": "2026-04-05T09:36:26.623Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 80, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:36:26.623Z", "tastm_log_id": 565, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:36:54.195817	80
341	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	80	{"after": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:37:05.812Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-09-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 0}, "before": {"gender": "Female", "pdl_id": 80, "birthday": "2000-02-02", "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "first_name": "Kathren", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:36:54.803Z", "case_number": "12312", "middle_name": "Brina", "pdl_picture": "pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Female", "pdl_id": 80, "remarks": "", "birthday": "2000-02-02", "gcta_days": 21, "last_name": "Aguigam", "created_at": "2026-04-05T09:35:42.063Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Kathren", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:36:54.803Z", "amount_paid": 0, "case_number": "12312", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775381742012-347140480.jpg", "rfid_number": "1112223335", "tastm_hours": 21, "gcta_history": [{"pdl_id": 80, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 417, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 80, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 418, "date_granted": "2026-04-05T09:36:26.623Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 80, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:36:26.623Z", "tastm_log_id": 565, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Sentenced", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:37:05.81297	80
342	11	CREATE_PDL	pdl_tbl	81	{"rfid": "1233332221", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Cyril Tagana"}	192.168.254.128	2026-04-05 17:48:09.064878	81
343	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [81], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:48:17.582594	\N
344	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	81	{"after": {"gender": "", "pdl_id": 81, "birthday": "2000-10-10", "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "first_name": "Cyril", "pdl_status": "Detained", "updated_at": "2026-04-05T09:52:25.327Z", "case_number": "123", "middle_name": "Santos", "pdl_picture": "pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 81, "birthday": "2000-10-10", "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "first_name": "Cyril", "pdl_status": "Detained", "updated_at": "2026-04-05T09:52:19.124Z", "case_number": "123", "middle_name": "Santos", "pdl_picture": "pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 81, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Cyril", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:52:19.124Z", "amount_paid": 0, "case_number": "123", "hasMigrated": false, "middle_name": "Santos", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "tastm_hours": 21, "gcta_history": [{"pdl_id": 81, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 419, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 17:52:25.327254	81
345	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	81	{"after": {"gender": "", "pdl_id": 81, "birthday": "2000-10-10", "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "first_name": "Cyril", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:52:59.863Z", "case_number": "123", "middle_name": "Santos", "pdl_picture": "pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 81, "birthday": "2000-10-10", "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "first_name": "Cyril", "pdl_status": "Detained", "updated_at": "2026-04-05T09:52:26.039Z", "case_number": "123", "middle_name": "Santos", "pdl_picture": "pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 81, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Tagana", "created_at": "2026-04-05T09:48:09.064Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Cyril", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:52:26.039Z", "amount_paid": 0, "case_number": "123", "hasMigrated": true, "middle_name": "Santos", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775382489003-642162659.jpg", "rfid_number": "1233332221", "tastm_hours": 0, "gcta_history": [{"pdl_id": 81, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 419, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 81, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 420, "date_granted": "2026-04-05T09:52:25.327Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 81, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:52:25.327Z", "tastm_log_id": 566, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:52:59.863053	81
346	11	START_PROGRAM_SESSION	session_tbl	144	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 144, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 17:53:17.305503	\N
347	11	FINALIZE_PROGRAM_SESSION	session_tbl	144	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 144, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 17:53:24.151294	\N
348	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [81], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:53:38.996368	\N
349	11	CREATE_PDL	pdl_tbl	82	{"rfid": "1233332226", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Andrea Ducosin"}	192.168.254.128	2026-04-05 17:54:41.536162	82
350	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	82	{"after": {"gender": "Female", "pdl_id": 82, "birthday": "2000-10-10", "last_name": "Ducosin", "created_at": "2026-04-05T09:54:41.536Z", "crime_name": "Theft", "first_name": "Andrea", "pdl_status": "Detained", "updated_at": "2026-04-05T09:54:53.072Z", "case_number": "123132", "middle_name": "Tagana", "pdl_picture": "pdl-1775382881481-269078102.png", "rfid_number": "1233332226", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "Female", "pdl_id": 82, "birthday": "2000-10-10", "last_name": "Ducosin", "created_at": "2026-04-05T09:54:41.536Z", "crime_name": "Theft", "first_name": "Andrea", "pdl_status": "Detained", "updated_at": "2026-04-05T09:54:48.767Z", "case_number": "123132", "middle_name": "Tagana", "pdl_picture": "pdl-1775382881481-269078102.png", "rfid_number": "1233332226", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Female", "pdl_id": 82, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Ducosin", "created_at": "2026-04-05T09:54:41.536Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Andrea", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:54:48.767Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Tagana", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775382881481-269078102.png", "rfid_number": "1233332226", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 17:54:53.072223	82
353	11	CREATE_PDL	pdl_tbl	83	{"rfid": "1233332222", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Mark Wanta"}	192.168.254.128	2026-04-05 17:55:48.025102	83
354	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	83	{"after": {"gender": "Male", "pdl_id": 83, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:57:36.087Z", "case_number": "123", "middle_name": "Sinamban", "pdl_picture": "pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "Male", "pdl_id": 83, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:55:51.370Z", "case_number": "123", "middle_name": "Sinamban", "pdl_picture": "pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 83, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:55:51.370Z", "amount_paid": 0, "case_number": "123", "hasMigrated": false, "middle_name": "Sinamban", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 17:57:36.087681	83
355	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [83], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:57:39.905621	\N
356	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [83], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:57:39.951934	\N
357	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	83	{"after": {"gender": "Male", "pdl_id": 83, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T09:58:04.383Z", "case_number": "123", "middle_name": "Sinamban", "pdl_picture": "pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "Male", "pdl_id": 83, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T09:57:43.235Z", "case_number": "123", "middle_name": "Sinamban", "pdl_picture": "pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "Male", "pdl_id": 83, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Wanta", "created_at": "2026-04-05T09:55:48.025Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:57:43.235Z", "amount_paid": 0, "case_number": "123", "hasMigrated": true, "middle_name": "Sinamban", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775382947880-28074372.png", "rfid_number": "1233332222", "tastm_hours": 0, "gcta_history": [{"pdl_id": 83, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 423, "date_granted": "2026-04-05T09:57:36.087Z"}, {"pdl_id": 83, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 424, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 83, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T09:57:39.951Z", "tastm_log_id": 571, "total_hours_accumulated": "21.00"}, {"pdl_id": 83, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:57:36.087Z", "tastm_log_id": 570, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 17:58:04.38357	83
358	11	START_PROGRAM_SESSION	session_tbl	145	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 145, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 17:58:12.243745	\N
359	11	CANCEL_PROGRAM_SESSION	session_tbl	145	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 145, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 0}	192.168.254.128	2026-04-05 17:58:15.839702	\N
360	11	START_PROGRAM_SESSION	session_tbl	146	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 146, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 17:58:24.312689	\N
361	11	FINALIZE_PROGRAM_SESSION	session_tbl	146	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 146, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 17:58:30.367137	\N
362	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [83], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:58:32.774488	\N
363	11	CREATE_PDL	pdl_tbl	84	{"rfid": "1233332227", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Lider Wanta"}	192.168.254.128	2026-04-05 17:59:27.726599	84
365	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [84], "credits_granted_to": 1}	192.168.254.128	2026-04-05 17:59:39.29292	\N
366	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [84], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 17:59:39.341344	\N
364	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	84	{"after": {"gender": "", "pdl_id": 84, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "first_name": "Lider", "pdl_status": "Detained", "updated_at": "2026-04-05T09:59:38.079Z", "case_number": "123132", "middle_name": "Moral", "pdl_picture": "pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "", "pdl_id": 84, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "first_name": "Lider", "pdl_status": "Detained", "updated_at": "2026-04-05T09:59:30.980Z", "case_number": "123132", "middle_name": "Moral", "pdl_picture": "pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 84, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Lider", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T09:59:30.980Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Moral", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 17:59:38.079648	84
367	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	84	{"after": {"gender": "", "pdl_id": 84, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "first_name": "Lider", "pdl_status": "Sentenced", "updated_at": "2026-04-05T10:00:03.980Z", "case_number": "123132", "middle_name": "Moral", "pdl_picture": "pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 84, "birthday": "2000-10-10", "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "first_name": "Lider", "pdl_status": "Detained", "updated_at": "2026-04-05T09:59:41.920Z", "case_number": "123132", "middle_name": "Moral", "pdl_picture": "pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 84, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Wanta", "created_at": "2026-04-05T09:59:27.726Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Lider", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T09:59:41.920Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Moral", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775383167688-451053284.png", "rfid_number": "1233332227", "tastm_hours": 0, "gcta_history": [{"pdl_id": 84, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 426, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 84, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 425, "date_granted": "2026-04-05T09:59:38.079Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 84, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T09:59:39.341Z", "tastm_log_id": 573, "total_hours_accumulated": "21.00"}, {"pdl_id": 84, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T09:59:38.079Z", "tastm_log_id": 572, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 18:00:03.980633	84
368	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [84], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:00:43.669506	\N
369	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69], "pdls_affected_count": 2}	192.168.254.128	2026-04-05 18:10:44.593889	\N
370	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [69, 84], "pdls_affected_count": 2}	192.168.254.128	2026-04-05 18:12:58.321181	\N
371	11	CREATE_PDL	pdl_tbl	85	{"rfid": "1113332221", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Rod Aguigam"}	192.168.254.128	2026-04-05 18:14:05.912714	85
372	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [85], "credits_granted_to": 1}	192.168.254.128	2026-04-05 18:14:09.704726	\N
373	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [84], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:14:09.776898	\N
374	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	85	{"after": {"gender": "", "pdl_id": 85, "birthday": "2000-10-10", "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "first_name": "Rod", "pdl_status": "Detained", "updated_at": "2026-04-05T10:14:17.099Z", "case_number": "011", "middle_name": "Brina", "pdl_picture": "pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 85, "birthday": "2000-10-10", "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "first_name": "Rod", "pdl_status": "Detained", "updated_at": "2026-04-05T10:14:11.846Z", "case_number": "011", "middle_name": "Brina", "pdl_picture": "pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 85, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Rod", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T10:14:11.846Z", "amount_paid": 0, "case_number": "011", "hasMigrated": false, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "tastm_hours": 21, "gcta_history": [{"pdl_id": 85, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 427, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 18:14:17.099896	85
375	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [85], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:14:22.656661	\N
376	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	85	{"after": {"gender": "", "pdl_id": 85, "birthday": "2000-10-10", "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "first_name": "Rod", "pdl_status": "Sentenced", "updated_at": "2026-04-05T10:14:44.757Z", "case_number": "011", "middle_name": "Brina", "pdl_picture": "pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 85, "birthday": "2000-10-10", "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "first_name": "Rod", "pdl_status": "Detained", "updated_at": "2026-04-05T10:14:25.746Z", "case_number": "011", "middle_name": "Brina", "pdl_picture": "pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 85, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Aguigam", "created_at": "2026-04-05T10:14:05.912Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Rod", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T10:14:25.746Z", "amount_paid": 0, "case_number": "011", "hasMigrated": true, "middle_name": "Brina", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775384045869-661779045.png", "rfid_number": "1113332221", "tastm_hours": 0, "gcta_history": [{"pdl_id": 85, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 427, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 85, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 428, "date_granted": "2026-04-05T10:14:17.099Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 85, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T10:14:22.656Z", "tastm_log_id": 576, "total_hours_accumulated": "21.00"}, {"pdl_id": 85, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T10:14:17.099Z", "tastm_log_id": 575, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 18:14:44.757303	85
377	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [85], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:14:51.532257	\N
378	11	CREATE_PDL	pdl_tbl	86	{"rfid": "1113332222", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Wakanda Foreva"}	192.168.254.128	2026-04-05 18:16:30.016901	86
379	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [86], "credits_granted_to": 1}	192.168.254.128	2026-04-05 18:16:33.560588	\N
380	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	86	{"after": {"gender": "", "pdl_id": 86, "birthday": "2000-10-10", "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "first_name": "Wakanda", "pdl_status": "Detained", "updated_at": "2026-04-05T10:16:40.067Z", "case_number": "123132", "middle_name": "Santos", "pdl_picture": "pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 86, "birthday": "2000-10-10", "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "first_name": "Wakanda", "pdl_status": "Detained", "updated_at": "2026-04-05T10:16:35.439Z", "case_number": "123132", "middle_name": "Santos", "pdl_picture": "pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 20}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 86, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "daily_rate": 1000, "first_name": "Wakanda", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T10:16:35.439Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Santos", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "tastm_hours": 21, "gcta_history": [{"pdl_id": 86, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 429, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 20}}	192.168.254.128	2026-04-05 18:16:40.067755	86
381	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:16:43.16995	\N
382	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:16:59.901006	\N
383	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 86], "pdls_affected_count": 2}	192.168.254.128	2026-04-05 18:18:06.656512	\N
384	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69, 86], "pdls_affected_count": 3}	192.168.254.128	2026-04-05 18:22:28.211365	\N
385	11	START_PROGRAM_SESSION	session_tbl	147	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 147, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 18:22:44.319834	\N
386	11	FINALIZE_PROGRAM_SESSION	session_tbl	147	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 147, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 18:22:49.936037	\N
387	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:22:51.813478	\N
388	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:25:12.065523	\N
389	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69], "pdls_affected_count": 2}	192.168.254.128	2026-04-05 18:25:47.690066	\N
390	11	START_PROGRAM_SESSION	session_tbl	148	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 148, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 18:26:19.737097	\N
391	11	FINALIZE_PROGRAM_SESSION	session_tbl	148	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 148, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 18:26:25.4242	\N
392	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 18:26:27.25994	\N
410	11	FINALIZE_PROGRAM_SESSION	session_tbl	150	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 150, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 19:37:29.532016	\N
411	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [87], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:37:30.683683	\N
425	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	152	{"after": {"pdl_id": 88, "status": "Active", "session_id": 152, "timestamp_in": "2026-04-05T11:49:05.457Z", "attendance_id": 230, "hours_attended": "60.00"}, "before": {"pdl_id": 88, "status": "Active", "session_id": 152, "timestamp_in": "2026-04-05T11:46:46.702Z", "attendance_id": 230, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "60.00", "old_hours": "2.00"}	192.168.254.128	2026-04-05 19:49:05.457151	88
393	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	86	{"after": {"gender": "", "pdl_id": 86, "birthday": "2000-10-10", "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "first_name": "Wakanda", "pdl_status": "Sentenced", "updated_at": "2026-04-05T11:09:39.650Z", "case_number": "123132", "middle_name": "Santos", "pdl_picture": "pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-03", "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 86, "birthday": "2000-10-10", "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "first_name": "Wakanda", "pdl_status": "Detained", "updated_at": "2026-04-05T10:33:40.090Z", "case_number": "123132", "middle_name": "Santos", "pdl_picture": "pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 86, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Foreva", "created_at": "2026-04-05T10:16:30.016Z", "crime_name": "Robbery", "daily_rate": 1000, "first_name": "Wakanda", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T10:33:40.090Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Santos", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775384189974-968797930.png", "rfid_number": "1113332222", "tastm_hours": 0, "gcta_history": [{"pdl_id": 86, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 429, "date_granted": "2026-04-04T16:00:00.000Z"}, {"pdl_id": 86, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 430, "date_granted": "2026-04-05T10:16:40.067Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 86, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T10:16:40.067Z", "tastm_log_id": 577, "total_hours_accumulated": "21.00"}, {"pdl_id": 86, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T10:26:27.259Z", "tastm_log_id": 581, "total_hours_accumulated": "25.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-03", "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 19:09:39.650092	86
394	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69, 86], "pdls_affected_count": 3}	192.168.254.128	2026-04-05 19:17:23.591171	\N
395	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:18:39.565988	\N
396	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:18:48.191761	\N
397	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69, 86], "pdls_affected_count": 3}	192.168.254.128	2026-04-05 19:19:49.911173	\N
398	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [82, 69, 86], "pdls_affected_count": 3}	192.168.254.128	2026-04-05 19:29:46.674167	\N
399	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:31:42.386992	\N
400	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:31:55.994354	\N
401	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86, 82, 69], "pdls_affected_count": 3}	192.168.254.128	2026-04-05 19:33:13.724214	\N
402	11	START_PROGRAM_SESSION	session_tbl	149	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 149, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 19:33:34.146535	\N
403	11	FINALIZE_PROGRAM_SESSION	session_tbl	149	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 149, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 19:33:46.080455	\N
404	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [86], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:33:48.810776	\N
405	11	CREATE_PDL	pdl_tbl	87	{"rfid": "1133223311", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Papa Piolo"}	192.168.254.128	2026-04-05 19:37:03.900455	87
406	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	87	{"after": {"gender": "", "pdl_id": 87, "birthday": "2000-10-10", "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "first_name": "Papa", "pdl_status": "Detained", "updated_at": "2026-04-05T11:37:11.324Z", "case_number": "123", "middle_name": "Panget", "pdl_picture": "pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "", "pdl_id": 87, "birthday": "2000-10-10", "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "first_name": "Papa", "pdl_status": "Detained", "updated_at": "2026-04-05T11:37:07.378Z", "case_number": "123", "middle_name": "Panget", "pdl_picture": "pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 87, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "daily_rate": 1000, "first_name": "Papa", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T11:37:07.378Z", "amount_paid": 0, "case_number": "123", "hasMigrated": false, "middle_name": "Panget", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 19:37:11.324736	87
407	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [87], "credits_granted_to": 1}	192.168.254.128	2026-04-05 19:37:13.293145	\N
408	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [87], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:37:13.330546	\N
409	11	START_PROGRAM_SESSION	session_tbl	150	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 150, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 19:37:22.335401	\N
412	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	87	{"after": {"gender": "", "pdl_id": 87, "birthday": "2000-10-10", "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "first_name": "Papa", "pdl_status": "Sentenced", "updated_at": "2026-04-05T11:37:52.095Z", "case_number": "123", "middle_name": "Panget", "pdl_picture": "pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-03", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 87, "birthday": "2000-10-10", "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "first_name": "Papa", "pdl_status": "Detained", "updated_at": "2026-04-05T11:37:32.874Z", "case_number": "123", "middle_name": "Panget", "pdl_picture": "pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 87, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Piolo", "created_at": "2026-04-05T11:37:03.900Z", "crime_name": "Drugs", "daily_rate": 1000, "first_name": "Papa", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T11:37:32.874Z", "amount_paid": 0, "case_number": "123", "hasMigrated": true, "middle_name": "Panget", "pdl_picture": "http://192.168.254.128:5000/public/uploads/pdl-1775389023742-371880274.jpg", "rfid_number": "1133223311", "tastm_hours": 0, "gcta_history": [{"pdl_id": 87, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 431, "date_granted": "2026-04-05T11:37:11.324Z"}, {"pdl_id": 87, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 432, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 87, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T11:37:11.324Z", "tastm_log_id": 586, "total_hours_accumulated": "21.00"}, {"pdl_id": 87, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T11:37:30.683Z", "tastm_log_id": 587, "total_hours_accumulated": "23.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-03", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 19:37:52.095217	87
413	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"message": "Automated TASTM synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "affected_pdl_ids": [87], "pdls_affected_count": 1}	192.168.254.128	2026-04-05 19:37:55.554999	\N
414	11	CREATE_PDL	pdl_tbl	88	{"rfid": "3332221113", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Mark Lising2"}	192.168.254.128	2026-04-05 19:45:24.089157	88
415	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	88	{"after": {"gender": "", "pdl_id": 88, "birthday": "2000-10-10", "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T11:45:32.895Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "", "pdl_id": 88, "birthday": "2000-10-10", "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T11:45:27.268Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 88, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T11:45:27.268Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 19:45:32.895858	88
416	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [88], "credits_granted_to": 1}	192.168.254.128	2026-04-05 19:45:34.554765	\N
417	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [79, 78, 77, 87, 80, 85, 81, 83, 84, 88], "message": "Automated TASTM sync completed.", "affected_count": 10}	192.168.254.128	2026-04-05 19:45:34.608987	\N
418	11	START_PROGRAM_SESSION	session_tbl	151	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 151, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "5.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "5", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 19:45:46.392501	\N
419	11	FINALIZE_PROGRAM_SESSION	session_tbl	151	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 151, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "5.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 19:45:56.06412	\N
420	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:45:59.127905	\N
421	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	88	{"after": {"gender": "", "pdl_id": 88, "birthday": "2000-10-10", "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T11:46:26.954Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-07-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-03-03", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 62}, "before": {"gender": "", "pdl_id": 88, "birthday": "2000-10-10", "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T11:46:01.610Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 88, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Lising2", "created_at": "2026-04-05T11:45:24.089Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T11:46:01.610Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221113", "tastm_hours": 0, "gcta_history": [{"pdl_id": 88, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 433, "date_granted": "2026-04-05T11:45:32.895Z"}, {"pdl_id": 88, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 434, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 88, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T11:45:32.895Z", "tastm_log_id": 588, "total_hours_accumulated": "21.00"}, {"pdl_id": 88, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T11:45:59.127Z", "tastm_log_id": 591, "total_hours_accumulated": "26.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-03-03", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 19:46:26.954367	88
422	11	START_PROGRAM_SESSION	session_tbl	152	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 152, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 19:46:42.542835	\N
423	11	FINALIZE_PROGRAM_SESSION	session_tbl	152	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 152, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 19:46:48.923159	\N
424	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:46:51.305651	\N
426	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:49:10.982946	\N
427	11	MSEC_VOID_CREDITS	multiple_credit_logs	88	{"message": "MSEC officially VOIDED TASTM credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "TASTM", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 19:49:17.694111	88
428	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:49:22.89733	\N
429	11	MSEC_VOID_CREDITS	multiple_credit_logs	88	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 19:50:21.442162	88
430	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:57:44.783189	\N
431	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 19:59:41.106651	\N
432	11	MSEC_RESTORE_CREDITS	multiple_credit_logs	88	{"reason": "MSEC Appeal/Review Approval", "message": "MSEC officially RESTORED TASTM credits for the period of 2026-04.", "status_change": "Voided -> Active", "month_affected": "2026-04", "target_restored": "TASTM"}	192.168.254.128	2026-04-05 20:02:45.29013	88
433	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 20:02:56.714267	\N
434	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 20:04:29.981164	\N
435	11	MSEC_VOID_CREDITS	multiple_credit_logs	88	{"message": "MSEC officially VOIDED TASTM credits for the period of 2026-04.", "status_change": "Active -> Voided", "target_voided": "TASTM", "month_affected": "2026-04"}	192.168.254.128	2026-04-05 20:04:48.665427	88
436	11	MSEC_RESTORE_CREDITS	multiple_tables	88	{"message": "MSEC RESTORED TASTM and reactivated attendance for 2026-04.", "status_change": "Voided -> Active", "month_affected": "2026-04", "target_restored": "TASTM"}	192.168.254.128	2026-04-05 20:06:34.870159	88
437	11	CREATE_PDL	pdl_tbl	89	{"rfid": "3332221115", "status": "Detained", "message": "Initial registration and profiling completed.", "fullname": "Mark Lising3"}	192.168.254.128	2026-04-05 20:07:46.142962	89
438	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	89	{"after": {"gender": "", "pdl_id": 89, "birthday": "2000-10-10", "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T12:07:53.544Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 42}, "before": {"gender": "", "pdl_id": 89, "birthday": "2000-10-10", "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T12:07:49.894Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 0}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 89, "remarks": "", "birthday": "2000-10-10", "gcta_days": 21, "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Detained", "subsidiary": null, "tastm_days": 21, "updated_at": "2026-04-05T12:07:49.894Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": false, "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "tastm_hours": 21, "gcta_history": [], "isGctaLocked": false, "isTastmLocked": false, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 0, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": null, "isMigrationLocked": false, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "subsidiary_judgment_date": "", "total_timeallowance_earned": 0}}	192.168.254.128	2026-04-05 20:07:53.54471	89
439	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-05", "unlocked_count": 0, "affected_pdl_ids": [89], "credits_granted_to": 1}	192.168.254.128	2026-04-05 20:08:18.999435	\N
440	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 20:08:19.126587	\N
441	11	UPDATE_JUDICIAL_RECORD	pdl_tbl	89	{"after": {"gender": "", "pdl_id": 89, "birthday": "2000-10-10", "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Sentenced", "updated_at": "2026-04-05T12:08:37.604Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "sentence_days": 0, "sentence_years": 2, "sentence_months": 0, "date_commited_pnp": "2025-09-09", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": "2027-09-08", "original_release_date": "2027-09-08", "date_of_final_judgment": "2026-04-01", "disqualification_reason": "Disqualified under RA 10592", "is_legally_disqualified": true, "total_timeallowance_earned": 0}, "before": {"gender": "", "pdl_id": 89, "birthday": "2000-10-10", "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "first_name": "Mark", "pdl_status": "Detained", "updated_at": "2026-04-05T12:08:20.891Z", "case_number": "123132", "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "sentence_days": 0, "sentence_years": 0, "sentence_months": 0, "date_commited_pnp": null, "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": null, "disqualification_reason": null, "is_legally_disqualified": false, "total_timeallowance_earned": 62}, "message": "Judicial record and credits updated.", "input_received": {"gender": "", "pdl_id": 89, "remarks": "", "birthday": "2000-10-10", "gcta_days": 0, "last_name": "Lising3", "created_at": "2026-04-05T12:07:46.142Z", "crime_name": "Theft", "daily_rate": 1000, "first_name": "Mark", "pdl_status": "Sentenced", "subsidiary": null, "tastm_days": 0, "updated_at": "2026-04-05T12:08:20.891Z", "amount_paid": 0, "case_number": "123132", "hasMigrated": true, "middle_name": "Sinamban", "pdl_picture": null, "rfid_number": "3332221115", "tastm_hours": 0, "gcta_history": [{"pdl_id": 89, "status": "Active", "remarks": "Migration", "month_year": "2026-04-01", "days_earned": 21, "gcta_log_id": 435, "date_granted": "2026-04-05T12:07:53.544Z"}, {"pdl_id": 89, "status": "Active", "remarks": "Automated GCTA", "month_year": "2026-04-01", "days_earned": 20, "gcta_log_id": 436, "date_granted": "2026-04-04T16:00:00.000Z"}], "isGctaLocked": false, "isTastmLocked": true, "sentence_days": 0, "subsidiary_id": null, "tastm_history": [{"pdl_id": 89, "status": "Active", "remarks": "Automated TASTM", "month_year": "2026-04-01", "days_earned": 0, "date_granted": "2026-04-05T12:08:19.126Z", "tastm_log_id": 596, "total_hours_accumulated": "21.00"}, {"pdl_id": 89, "status": "Inactive", "remarks": "Migration - Locked", "month_year": "2026-04-01", "days_earned": 21, "date_granted": "2026-04-05T12:07:53.544Z", "tastm_log_id": 595, "total_hours_accumulated": "21.00"}], "is_recommitted": true, "originalStatus": "Detained", "sentence_years": 2, "sentence_months": 0, "isManualOverride": true, "date_commited_pnp": "2025-09-09", "isMigrationLocked": true, "total_fine_amount": "", "date_admitted_bjmp": "2025-10-10", "is_locked_for_gcta": false, "isEditingSubsidiary": false, "expected_releasedate": null, "original_release_date": null, "date_of_final_judgment": "2026-04-01", "disqualification_reason": null, "is_legally_disqualified": true, "subsidiary_judgment_date": "", "total_timeallowance_earned": 62}}	192.168.254.128	2026-04-05 20:08:37.604765	89
442	11	START_PROGRAM_SESSION	session_tbl	153	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 153, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-05 20:08:57.36666	\N
443	11	FINALIZE_PROGRAM_SESSION	session_tbl	153	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 153, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-05 20:09:03.551231	\N
444	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	153	{"after": {"pdl_id": 89, "status": "Active", "session_id": 153, "timestamp_in": "2026-04-05T12:09:09.132Z", "attendance_id": 231, "hours_attended": "8.00"}, "before": {"pdl_id": 89, "status": "Active", "session_id": 153, "timestamp_in": "2026-04-05T12:09:01.604Z", "attendance_id": 231, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "8.00", "old_hours": "2.00"}	192.168.254.128	2026-04-05 20:09:09.132102	89
445	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-05 20:09:10.682839	\N
446	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [79, 77, 69, 80, 89], "message": "Automated TASTM sync completed.", "affected_count": 5}	192.168.254.128	2026-04-05 20:11:44.957068	\N
450	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-30", "unlocked_count": 0, "affected_pdl_ids": [82, 86, 85, 81, 83, 87, 84], "credits_granted_to": 7}	192.168.254.128	2026-04-05 20:13:43.641256	\N
451	11	MSEC_RESTORE_CREDITS	multiple_tables	88	{"message": "MSEC RESTORED GCTA and reactivated attendance for 2026-04.", "status_change": "Voided -> Active", "month_affected": "2026-04", "target_restored": "GCTA"}	192.168.254.128	2026-04-05 20:16:10.012787	88
452	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-30", "unlocked_count": 0, "affected_pdl_ids": [88], "credits_granted_to": 1}	192.168.254.128	2026-04-05 20:16:12.114976	\N
453	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-30", "unlocked_count": 0, "affected_pdl_ids": [79, 78, 80, 89], "credits_granted_to": 4}	192.168.254.128	2026-04-05 20:17:59.67092	\N
454	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-30", "unlocked_count": 0, "affected_pdl_ids": [86], "credits_granted_to": 1}	192.168.254.128	2026-04-05 20:19:18.552447	\N
455	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-04-30", "unlocked_count": 0, "affected_pdl_ids": [86], "credits_granted_to": 1}	192.168.254.128	2026-04-05 20:20:03.065033	\N
456	11	MSEC_VOID_CREDITS	multiple_credit_logs	86	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-05.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-05"}	192.168.254.128	2026-04-05 20:20:31.003468	86
457	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed.", "trigger": "System Auto-Sync (useEffect)", "sync_date": "2026-05-31", "unlocked_count": 0, "affected_pdl_ids": [83, 89, 82, 77, 84, 69, 86, 88, 79, 78, 80, 87, 85, 81], "credits_granted_to": 14}	192.168.254.128	2026-04-05 20:20:44.842479	\N
458	11	MSEC_RESTORE_CREDITS	multiple_tables	86	{"message": "MSEC RESTORED GCTA and reactivated attendance for 2026-05.", "status_change": "Voided -> Active", "month_affected": "2026-05", "target_restored": "GCTA"}	192.168.254.128	2026-04-05 20:21:25.599802	86
459	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 00:00:43.018574	\N
460	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 00:02:50.596098	\N
461	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	154	{"after": {"pdl_id": 89, "status": "Active", "row_hash": null, "session_id": 154, "timestamp_in": "2026-04-05T16:03:25.982Z", "attendance_id": 232, "hours_attended": "4.00"}, "before": {"pdl_id": 89, "status": "Active", "row_hash": null, "session_id": 154, "timestamp_in": "2026-04-05T12:12:44.923Z", "attendance_id": 232, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted for PDL.", "new_hours": "4.00", "old_hours": "2.00"}	192.168.254.128	2026-04-06 00:03:25.982392	89
462	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 00:03:29.085199	\N
463	11	SYSTEM_GCTA_SYNC	gcta_days_log	\N	{"message": "Automated GCTA synchronization performed with integrity hashing.", "sync_month": "2026-06", "unlocked_count": 0, "affected_pdl_ids": [87, 85, 82, 81, 69, 83, 77, 84, 88, 79, 86, 78, 80, 89], "credits_granted_to": 14}	192.168.254.128	2026-04-06 00:10:52.463522	\N
464	11	MSEC_VOID_CREDITS	multiple_credit_logs	89	{"message": "MSEC officially VOIDED GCTA credits for the period of 2026-07.", "status_change": "Active -> Voided", "target_voided": "GCTA", "month_affected": "2026-07"}	192.168.254.128	2026-04-06 00:11:20.049767	89
465	11	MSEC_RESTORE_CREDITS	multiple_tables	89	{"message": "MSEC RESTORED BOTH and reactivated attendance for 2026-07.", "status_change": "Voided -> Active", "month_affected": "2026-07", "target_restored": "BOTH"}	192.168.254.128	2026-04-06 00:13:00.456978	89
466	11	START_PROGRAM_SESSION	session_tbl	155	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 155, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.254.128	2026-04-06 00:18:08.438205	\N
467	11	CANCEL_PROGRAM_SESSION	session_tbl	155	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"ALS Exam\\" was discarded.", "deleted_snapshot": {"session_id": 155, "program_name": "Education", "session_date": "2026-04-05", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendance_records_deleted": 1}	192.168.254.128	2026-04-06 00:19:11.928271	\N
468	11	START_PROGRAM_SESSION	session_tbl	156	{"message": "Initialized new session for Education: 2", "session_data": {"session_id": 156, "program_name": "Education", "session_date": "2026-04-05", "session_name": "2", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.254.128	2026-04-06 00:19:23.003497	\N
485	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 01:47:57.157111	\N
469	11	FINALIZE_PROGRAM_SESSION	session_tbl	156	{"message": "Warden finalized session: 2", "program_name": "Education", "original_data": {"session_id": 156, "program_name": "Education", "session_date": "2026-04-05", "session_name": "2", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendee_count": 1}	192.168.254.128	2026-04-06 00:19:29.188364	\N
572	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:56:52.564103	\N
574	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:59:20.243743	\N
575	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 19:03:33.275418	\N
470	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "row_hash": "457f4a5f2f9c169e1b8e359e746c7ecbf620f2394e26ea998fe81b5d0c84ba44", "session_id": 156, "timestamp_in": "2026-04-05T16:21:20.527Z", "attendance_id": 234, "hours_attended": "5.00"}, "before": {"pdl_id": 89, "status": "Active", "row_hash": "baa9bb51e30163f447eb7cb29d5f23b99e92ef3c07293641d06fc401e07f405c", "session_id": 156, "timestamp_in": "2026-04-05T16:19:27.167Z", "attendance_id": 234, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "5.00", "old_hours": "2.00", "integrity_seal": "457f4a5f..."}	192.168.254.128	2026-04-06 00:21:20.527533	89
471	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "row_hash": "558cc694169324589e04866f3d189d4ade9f4e239b54cc824aa72f5a40ad12f0", "session_id": 156, "timestamp_in": "2026-04-05T16:48:58.358Z", "attendance_id": 234, "hours_attended": "5.00"}, "before": {"pdl_id": 89, "status": "Active", "row_hash": "457f4a5f2f9c169e1b8e359e746c7ecbf620f2394e26ea998fe81b5d0c84ba44", "session_id": 156, "timestamp_in": "2026-04-05T16:21:20.527Z", "attendance_id": 234, "hours_attended": "7.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "5.00", "old_hours": "7.00", "integrity_seal": "558cc694..."}	192.168.254.128	2026-04-06 00:48:58.356683	89
472	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 00:55:25.609084	\N
473	11	START_PROGRAM_SESSION	session_tbl	157	{"message": "Initialized new session for Education: asda", "session_data": {"session_id": 157, "program_name": "Education", "session_date": "2026-04-05", "session_name": "asda", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-06 01:02:27.688104	\N
474	11	FINALIZE_PROGRAM_SESSION	session_tbl	157	{"message": "Warden finalized session: asda", "program_name": "Education", "original_data": {"session_id": 157, "program_name": "Education", "session_date": "2026-04-05", "session_name": "asda", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendee_count": 1}	192.168.254.128	2026-04-06 01:02:35.636551	\N
475	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	157	{"after": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM", "row_hash": "7074d10f4f407ba2e6f85789f35bd20f134c45f19f76f01ef39b4787a504e813", "session_id": 157, "timestamp_in": "2026-04-05T17:06:07.956Z", "attendance_id": 235, "hours_attended": "3.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log", "row_hash": "5fee909fecd1185811193cc0ba1bd0e3ebfa17cadf8a5d002e9e83c8aab2d65b", "session_id": 157, "timestamp_in": "2026-04-05T17:02:31.822Z", "attendance_id": 235, "hours_attended": "2.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "3.00", "old_hours": "2.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM", "integrity_seal": "7074d10f..."}	192.168.254.128	2026-04-06 01:06:07.956158	89
476	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	157	{"after": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM | MANUALLY ADJUSTED: 4/6/2026 1:12:38 AM", "row_hash": "5982593289ac6d010a55c23621344a0145dde838d91f7a7996d0ef474ed67831", "session_id": 157, "timestamp_in": "2026-04-05T17:12:38.962Z", "attendance_id": 235, "hours_attended": "5.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM", "row_hash": "7074d10f4f407ba2e6f85789f35bd20f134c45f19f76f01ef39b4787a504e813", "session_id": 157, "timestamp_in": "2026-04-05T17:06:07.956Z", "attendance_id": 235, "hours_attended": "3.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "5.00", "old_hours": "3.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:12:38 AM", "integrity_seal": "59825932..."}	192.168.254.128	2026-04-06 01:12:38.962172	89
477	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 01:13:15.826717	\N
478	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	157	{"after": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM | MANUALLY ADJUSTED: 4/6/2026 1:12:38 AM | MANUALLY ADJUSTED: 4/6/2026 1:15:31 AM", "row_hash": "9cf57416b024bc52c3a21ae51d00d3c3c22438ebbf4022ff100112f0f968550f", "session_id": 157, "timestamp_in": "2026-04-05T17:15:31.845Z", "attendance_id": 235, "hours_attended": "6.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": "Original System Log | MANUALLY ADJUSTED: 4/6/2026 1:06:07 AM | MANUALLY ADJUSTED: 4/6/2026 1:12:38 AM", "row_hash": "5982593289ac6d010a55c23621344a0145dde838d91f7a7996d0ef474ed67831", "session_id": 157, "timestamp_in": "2026-04-05T17:12:38.962Z", "attendance_id": 235, "hours_attended": "5.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "6.00", "old_hours": "5.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:15:31 AM", "integrity_seal": "9cf57416..."}	192.168.254.128	2026-04-06 01:15:31.844672	89
479	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [81, 83, 89, 77, 88, 86, 78, 87], "message": "Automated TASTM sync completed.", "affected_count": 8}	192.168.254.128	2026-04-06 01:15:32.664789	\N
480	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [81, 83, 77, 89, 88, 86, 78, 87], "message": "Automated TASTM sync completed.", "affected_count": 8}	192.168.254.128	2026-04-06 01:16:50.28205	\N
481	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [81, 83, 77, 88, 89, 86, 78, 87], "message": "Automated TASTM sync completed.", "affected_count": 8}	192.168.254.128	2026-04-06 01:17:01.825862	\N
482	14	USER_LOGIN	usertbl	14	{"role": "Jail Officer", "message": "User logged in successfully.", "fullname": "Mark Lising", "session_expiry": "8h"}	192.168.254.128	2026-04-06 01:23:22.712257	\N
483	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 01:23:39.037338	\N
484	11	INTEGRITY_REPAIR	attendance_tbl	156	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "cc949df2...", "corrected_hours": "4.00", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 01:47:22.72449	89
486	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 01:48:52.339836	\N
487	11	INTEGRITY_REPAIR	attendance_tbl	156	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "e7abeefc...", "corrected_hours": "5.00", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 01:49:07.661808	89
488	11	INTEGRITY_REPAIR	attendance_tbl	154	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "bdc9f3b1...", "corrected_hours": "4.00", "paper_log_reference": "xzc"}	192.168.254.128	2026-04-06 01:50:39.39656	89
489	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 01:50:43.656372	\N
490	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 12:11:10.285476	\N
491	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "c251278f...", "paper_log_reference": ""}	192.168.254.128	2026-04-06 12:45:29.069859	81
492	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "46ea21a1...", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 12:46:09.323858	88
493	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "232b9288...", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 12:52:24.529606	81
494	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "b9545ed0...", "paper_log_reference": "asd"}	192.168.254.128	2026-04-06 12:52:52.423924	81
495	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "b6d921c3...", "paper_log_reference": "sda"}	192.168.254.128	2026-04-06 12:54:42.515689	81
496	11	INTEGRITY_REPAIR	attendance_tbl	\N	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "e60857ce...", "paper_log_reference": "sadas"}	192.168.254.128	2026-04-06 12:58:06.395079	81
497	11	INTEGRITY_REPAIR	attendance_tbl	144	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "1f0bc795...", "corrected_hours": "2.00", "paper_log_reference": "asdsa"}	192.168.254.128	2026-04-06 12:59:31.015174	81
498	11	INTEGRITY_REPAIR	attendance_tbl	231	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "abd2f153...", "corrected_hours": "21", "paper_log_reference": "adsdsa"}	192.168.254.128	2026-04-06 13:01:24.385881	89
499	11	INTEGRITY_REPAIR	attendance_tbl	231	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "bca78aec...", "corrected_hours": "2", "paper_log_reference": "asdas"}	192.168.254.128	2026-04-06 13:01:41.811732	89
500	11	INTEGRITY_REPAIR	attendance_tbl	231	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "b93e613a...", "corrected_hours": "8", "paper_log_reference": "dasd"}	192.168.254.128	2026-04-06 13:07:39.871639	89
501	11	INTEGRITY_REPAIR	attendance_tbl	231	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "3ad26917...", "corrected_hours": "8", "paper_log_reference": "dasd"}	192.168.254.128	2026-04-06 13:07:41.875194	89
502	11	INTEGRITY_REPAIR	attendance_tbl	153	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "d8e3a1ca...", "corrected_hours": "2", "paper_log_reference": "asdas"}	192.168.254.128	2026-04-06 13:08:33.238792	89
503	11	INTEGRITY_REPAIR	attendance_tbl	144	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "8af7c234...", "corrected_hours": "5.00", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 13:09:51.331192	81
504	11	INTEGRITY_REPAIR	attendance_tbl	144	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "221a5aa5...", "corrected_hours": "2", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 13:11:04.951391	81
505	11	INTEGRITY_REPAIR	attendance_tbl	144	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "0933be85...", "corrected_hours": "3", "paper_log_reference": "Page 45"}	192.168.254.128	2026-04-06 13:12:25.402135	81
506	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89, 81], "message": "Automated TASTM sync completed.", "affected_count": 2}	192.168.254.128	2026-04-06 13:12:44.385993	\N
507	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:13:33.550075	\N
508	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM", "row_hash": "b5351f54cb8b73d91245612f102c47c8eec4cd2559597745dfdc0010b496e2ee", "session_id": 156, "timestamp_in": "2026-04-06T05:19:21.003Z", "attendance_id": 234, "hours_attended": "70.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45]", "row_hash": "e7abeefcb9c198daeef5ba330c8ecc0a7daf6fc103960b7e02567b4edab3b9ad", "session_id": 156, "timestamp_in": "2026-04-05T17:49:07.661Z", "attendance_id": 234, "hours_attended": "5.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "70.00", "old_hours": "5.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM", "integrity_seal": "b5351f54..."}	192.168.254.128	2026-04-06 13:19:21.003591	89
509	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:19:32.15449	\N
529	11	START_PROGRAM_SESSION	session_tbl	159	{"message": "Initialized new session for Education: sadas", "session_data": {"session_id": 159, "program_name": "Education", "session_date": "2026-04-06", "session_name": "sadas", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.254.128	2026-04-06 16:20:53.63691	\N
530	11	CANCEL_PROGRAM_SESSION	session_tbl	159	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"sadas\\" was discarded.", "deleted_snapshot": {"session_id": 159, "program_name": "Education", "session_date": "2026-04-06", "session_name": "sadas", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendance_records_deleted": 1}	192.168.254.128	2026-04-06 16:29:37.255364	\N
573	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:57:19.006771	\N
510	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM", "row_hash": "05c3ef65d28ad4c266fdb801696d713abad639f675d152d2fadcb3eadbbe2fbf", "session_id": 156, "timestamp_in": "2026-04-06T05:25:11.857Z", "attendance_id": 234, "hours_attended": "10.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM", "row_hash": "b5351f54cb8b73d91245612f102c47c8eec4cd2559597745dfdc0010b496e2ee", "session_id": 156, "timestamp_in": "2026-04-06T05:19:21.003Z", "attendance_id": 234, "hours_attended": "70.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "10.00", "old_hours": "70.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM", "integrity_seal": "05c3ef65..."}	192.168.254.128	2026-04-06 13:25:11.857846	89
511	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:25:12.659449	\N
512	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:35 PM", "row_hash": "1fd0c6e08a87b53a0b01ece2c725764d389ade4f65d3abd2b636354509a8e0a6", "session_id": 156, "timestamp_in": "2026-04-06T05:25:35.994Z", "attendance_id": 234, "hours_attended": "12.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM", "row_hash": "05c3ef65d28ad4c266fdb801696d713abad639f675d152d2fadcb3eadbbe2fbf", "session_id": 156, "timestamp_in": "2026-04-06T05:25:11.857Z", "attendance_id": 234, "hours_attended": "10.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "12.00", "old_hours": "10.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:25:35 PM", "integrity_seal": "1fd0c6e0..."}	192.168.254.128	2026-04-06 13:25:35.994623	89
513	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:25:38.500056	\N
514	11	UPDATE_ATTENDANCE_HOURS	attendance_tbl	156	{"after": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:35 PM | MANUALLY ADJUSTED: 4/6/2026 1:26:09 PM", "row_hash": "0b10c2d22290672aabcb7265c0b79b1a5b8d35186c164b84308aa736e983e8d2", "session_id": 156, "timestamp_in": "2026-04-06T05:26:09.151Z", "attendance_id": 234, "hours_attended": "50.00"}, "before": {"pdl_id": 89, "status": "Active", "remarks": " | 🔧 REPAIRED: Verified via Paper Log [Ref: Page 45] REPAIRED: Verified via Paper Log [Ref: Page 45] | MANUALLY ADJUSTED: 4/6/2026 1:19:21 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:11 PM | MANUALLY ADJUSTED: 4/6/2026 1:25:35 PM", "row_hash": "1fd0c6e08a87b53a0b01ece2c725764d389ade4f65d3abd2b636354509a8e0a6", "session_id": 156, "timestamp_in": "2026-04-06T05:25:35.994Z", "attendance_id": 234, "hours_attended": "12.00"}, "message": "Attendance hours manually adjusted. New hash generated.", "new_hours": "50.00", "old_hours": "12.00", "remark_added": " | MANUALLY ADJUSTED: 4/6/2026 1:26:09 PM", "integrity_seal": "0b10c2d2..."}	192.168.254.128	2026-04-06 13:26:09.151194	89
515	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:26:19.301746	\N
516	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:48:49.829113	\N
517	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [88], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 13:49:31.599823	\N
518	11	CREDIT_INTEGRITY_REPAIR	tastm_days_log	548	{"message": "Manual re-seal for TASTM", "new_hash": "ac9fd41545...", "reference": "Page 45", "correction": "15 -> 15 days"}	192.168.254.128	2026-04-06 14:31:01.303453	75
519	11	CREDIT_INTEGRITY_REPAIR	tastm_days_log	548	{"message": "Manual re-seal for TASTM", "new_hash": "e2c91c4ab9...", "reference": "Page 45", "correction": "15 -> 15 days"}	192.168.254.128	2026-04-06 14:35:14.132488	75
520	11	CREDIT_INTEGRITY_REPAIR	tastm_days_log	548	{"message": "Manual re-seal for TASTM", "new_hash": "36c387dd42...", "reference": "Page-45", "correction": "17 -> 15 days"}	192.168.254.128	2026-04-06 14:35:41.672329	75
521	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	453	{"message": "Manual re-seal for GCTA", "new_hash": "03d75dccb6...", "reference": "Page 45", "correction": "20 -> 20 days"}	192.168.254.128	2026-04-06 14:38:54.250281	82
522	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	437	{"message": "Manual re-seal for GCTA", "new_hash": "5528279c6c...", "reference": "dadsa", "correction": "20 -> 20 days"}	192.168.254.128	2026-04-06 14:40:12.730457	82
523	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	422	{"message": "Manual re-seal for GCTA", "new_hash": "1e7d5bf60c...", "reference": "sadas", "correction": "20 -> 20 days"}	192.168.254.128	2026-04-06 14:41:02.164009	82
524	11	CREDIT_INTEGRITY_REPAIR	gcta_days_log	421	{"message": "Manual re-seal for GCTA", "new_hash": "1e7d5bf60c...", "reference": "312312", "correction": "21 -> 20 days"}	192.168.254.128	2026-04-06 14:44:20.292532	82
525	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 15:19:04.111528	\N
526	11	INTEGRITY_REPAIR	attendance_tbl	224	{"message": "A tampered record was manually re-sealed using physical log evidence.", "new_hash": "5e9a3ee0...", "corrected_hours": "2.00", "paper_log_reference": "asd"}	192.168.254.128	2026-04-06 15:41:35.586011	83
527	11	START_PROGRAM_SESSION	session_tbl	158	{"message": "Initialized new session for Education: 22", "session_data": {"session_id": 158, "program_name": "Education", "session_date": "2026-04-06", "session_name": "22", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "hours_granted": "2", "officer_assigned": "Mark JO1/ Rod JO1"}	192.168.254.128	2026-04-06 15:55:50.417326	\N
528	11	CANCEL_PROGRAM_SESSION	session_tbl	158	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"22\\" was discarded.", "deleted_snapshot": {"session_id": 158, "program_name": "Education", "session_date": "2026-04-06", "session_name": "22", "hours_to_earn": "2.00", "officer_in_charge": "Mark JO1/ Rod JO1"}, "attendance_records_deleted": 1}	192.168.254.128	2026-04-06 15:58:34.884654	\N
531	11	START_PROGRAM_SESSION	session_tbl	160	{"message": "Initialized new session for Education: ALS Exam", "session_data": {"session_id": 160, "program_name": "Education", "session_date": "2026-04-06", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.254.128	2026-04-06 16:30:22.130868	\N
532	11	FINALIZE_PROGRAM_SESSION	session_tbl	160	{"message": "Warden finalized session: ALS Exam", "program_name": "Education", "original_data": {"session_id": 160, "program_name": "Education", "session_date": "2026-04-06", "session_name": "ALS Exam", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendee_count": 1}	192.168.254.128	2026-04-06 16:47:28.650164	\N
533	11	START_PROGRAM_SESSION	session_tbl	161	{"message": "Initialized new session for Education: asdasd", "session_data": {"session_id": 161, "program_name": "Education", "session_date": "2026-04-06", "session_name": "asdasd", "hours_to_earn": "2.00", "officer_in_charge": "sda"}, "hours_granted": "2", "officer_assigned": "sda"}	192.168.254.128	2026-04-06 16:54:03.407107	\N
534	11	START_PROGRAM_SESSION	session_tbl	162	{"message": "Initialized new session for Education: asdas", "session_data": {"session_id": 162, "program_name": "Education", "session_date": "2026-04-06", "session_name": "asdas", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "hours_granted": "2", "officer_assigned": "2"}	192.168.254.128	2026-04-06 16:54:24.045195	\N
535	11	CANCEL_PROGRAM_SESSION	session_tbl	162	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"asdas\\" was discarded.", "deleted_snapshot": {"session_id": 162, "program_name": "Education", "session_date": "2026-04-06", "session_name": "asdas", "hours_to_earn": "2.00", "officer_in_charge": "2"}, "attendance_records_deleted": 0}	192.168.254.128	2026-04-06 16:54:32.318638	\N
536	11	START_PROGRAM_SESSION	session_tbl	163	{"message": "Initialized new session for Education: dasdsa", "session_data": {"session_id": 163, "program_name": "Education", "session_date": "2026-04-06", "session_name": "dasdsa", "hours_to_earn": "2.00", "officer_in_charge": "dsa"}, "hours_granted": "2", "officer_assigned": "dsa"}	192.168.254.128	2026-04-06 16:57:37.404596	\N
537	11	CANCEL_PROGRAM_SESSION	session_tbl	163	{"reason": "Manual cancellation (Misclick/Error)", "message": "Session \\"dasdsa\\" was discarded.", "deleted_snapshot": {"session_id": 163, "program_name": "Education", "session_date": "2026-04-06", "session_name": "dasdsa", "hours_to_earn": "2.00", "officer_in_charge": "dsa"}, "attendance_records_deleted": 0}	192.168.254.128	2026-04-06 16:57:41.272961	\N
538	11	SYSTEM_TASTM_SYNC	tastm_days_log	\N	{"pdls": [89], "message": "Automated TASTM sync completed.", "affected_count": 1}	192.168.254.128	2026-04-06 17:20:12.904327	\N
539	11	AUDIT_CENTER_UNLOCKED	audit_log_tbl	11	{"message": "Security Audit Center successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:20:27.42139	\N
540	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 17:22:20.746392	\N
541	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:23:52.030791	\N
542	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:24:15.390068	\N
543	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:28:28.182718	\N
544	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:15.548257	\N
545	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:17.982249	\N
546	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:23.568608	\N
547	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:24.4189	\N
548	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:25.028862	\N
549	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:25.598011	\N
550	11	UNAUTHORIZED_AUDIT_ATTEMPT	audit_log_tbl	11	{"message": "Failed password verification for Security Audit Center access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:26.172388	\N
551	11	AUDIT_CENTER_UNLOCKED	audit_log_tbl	11	{"message": "Security Audit Center successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:29:37.645154	\N
552	11	INTEGRITY_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "INTEGRITY_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:36:06.425501	\N
553	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:39:58.249746	\N
554	11	SYSTEM_LOGS_AUDIT_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_LOGS_AUDIT access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:40:10.779431	\N
555	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:40:14.625904	\N
556	11	SYSTEM_LOGS_AUDIT_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_LOGS_AUDIT access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:40:44.116484	\N
557	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 17:40:46.954055	\N
558	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:27:39.960717	\N
559	11	SYSTEM_MAINTENANCE_ACCESS_FAILED	audit_log_tbl	11	{"message": "Failed verification for SYSTEM_MAINTENANCE access.", "attempted_by": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:29:23.661388	\N
560	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:29:26.75923	\N
561	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:30:39.75371	\N
562	11	USER_LOGIN	usertbl	11	{"role": "Admin", "message": "User logged in successfully.", "fullname": "Admin Aguigam", "session_expiry": "8h"}	192.168.254.128	2026-04-06 18:35:13.742233	\N
563	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:35:21.041201	\N
564	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:36:31.160179	\N
565	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:37:39.43098	\N
566	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:40:52.129644	\N
567	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:43:44.809412	\N
568	11	SYSTEM_LOGS_AUDIT_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_LOGS_AUDIT module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:44:13.047608	\N
571	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 18:51:58.182116	\N
576	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 19:05:35.673199	\N
577	11	SYSTEM_MAINTENANCE_ACCESS_GRANTED	audit_log_tbl	11	{"message": "SYSTEM_MAINTENANCE module successfully unlocked.", "authorized_user": "Admin Aguigam"}	192.168.254.128	2026-04-06 19:14:35.514673	\N
\.


--
-- Data for Name: gcta_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gcta_days_log (gcta_log_id, pdl_id, month_year, days_earned, date_granted, status, remarks, row_hash) FROM stdin;
409	78	2026-04-01	21	2026-04-05 16:59:29.724481	Active	Migration	\N
385	71	2026-03-01	21	2026-03-30 00:02:05.683963	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-03-01)	\N
426	84	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
389	72	2026-04-01	20	2026-04-03 00:00:00	Active	Automated GCTA	\N
391	71	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
394	72	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
390	73	2026-04-01	21	2026-04-03 12:50:08.901228	Voided	Migration - Locked	\N
388	72	2026-04-01	21	2026-04-03 12:48:26.280494	Active	Migration	\N
425	84	2026-04-01	21	2026-04-05 17:59:38.079648	Active	Migration	\N
414	78	2026-04-01	20	2026-04-05 00:00:00	Voided	MSEC DQ: GCTA Voided for 2026-04	\N
427	85	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
415	79	2026-04-01	20	2026-04-05 00:00:00	Voided	Automated GCTA - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
416	79	2026-04-01	21	2026-04-05 17:31:04.140627	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
428	85	2026-04-01	21	2026-04-05 18:14:17.099896	Active	Migration	\N
417	80	2026-04-01	20	2026-04-05 00:00:00	Voided	Automated GCTA - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
395	74	2026-04-01	21	2026-04-04 14:19:36.994225	Active	Migration	\N
418	80	2026-04-01	21	2026-04-05 17:36:26.623793	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
419	81	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
397	74	2026-04-01	20	2026-04-04 00:00:00	Active	Automated GCTA	\N
420	81	2026-04-01	21	2026-04-05 17:52:25.327254	Active	Migration	\N
398	75	2026-04-01	21	2026-04-04 16:58:06.134787	Active	Migration	\N
377	69	2026-03-01	21	2026-03-29 23:40:53.956397	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-03-25)	\N
401	76	2026-04-01	21	2026-04-05 11:49:54.110336	Active	Migration	\N
393	69	2026-05-01	20	2026-05-01 00:00:00	Released	Automated GCTA	\N
381	69	2026-04-01	20	2026-04-29 00:00:00	Released	Automated GCTA (Restored by MSEC)	\N
384	70	2026-04-01	20	2026-04-29 00:00:00	Released	Automated GCTA	\N
386	70	2026-03-01	20	2026-03-30 00:00:00	Released	Automated GCTA	\N
392	70	2026-05-01	20	2026-05-01 00:00:00	Released	Automated GCTA	\N
382	70	2026-03-01	21	2026-03-30 00:00:56.015403	Released	Migration	\N
424	83	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
387	71	2026-04-01	20	2026-04-03 00:00:00	Active	Automated GCTA (Restored by MSEC)	\N
405	75	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
423	83	2026-04-01	21	2026-04-05 17:57:36.087681	Active	Migration	\N
406	77	2026-04-01	20	2026-04-05 00:00:00	Voided	Automated GCTA - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-05)	\N
407	77	2026-04-01	21	2026-04-05 16:54:26.605477	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-05)	\N
429	86	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
430	86	2026-04-01	21	2026-04-05 18:16:40.067755	Active	Migration	\N
432	87	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA	\N
431	87	2026-04-01	21	2026-04-05 19:37:11.324736	Active	Migration	\N
433	88	2026-04-01	21	2026-04-05 19:45:32.895858	Active	Migration	\N
436	89	2026-04-01	20	2026-04-05 00:00:00	Voided	Automated GCTA - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
435	89	2026-04-01	21	2026-04-05 20:07:53.54471	Voided	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	\N
439	85	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
440	81	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
441	83	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
442	87	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
443	84	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
434	88	2026-04-01	20	2026-04-05 00:00:00	Active	Automated GCTA (Restored by MSEC)	\N
444	88	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
445	79	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
446	78	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
447	80	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
448	89	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA	\N
451	83	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
452	89	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
454	77	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
455	84	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
456	69	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
457	86	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
458	88	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
459	79	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
460	78	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
461	80	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
462	87	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
463	85	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
464	81	2026-06-01	20	2026-06-01 00:00:00	Active	Automated GCTA	\N
450	86	2026-05-01	20	2026-05-01 00:00:00	Active	Automated GCTA (Restored by MSEC)	\N
465	87	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	3fa7698b9ba0360b0c44deb87ed5114a28e20596d49dc6e53ed19322d55ca44a
466	85	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	3994ed6eeae036c05acb96195f00bd8eaa7105275fe688abfe005ecc5f82e277
467	82	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	26351969b37f9680e6bb1beaec14e84b80c6ea4806537058ada7c8407ebdd690
468	81	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	095ad96b825160a4e67273b8d1084bb989f3cf76f23e3f0a47d77986def12fb0
469	69	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	e5869e0e487b8f82384c73140d465ede6afabf1987594669a0a31447062f9691
470	83	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	2fcc7c25dc4125950c5265545d196c3f6a57925b0be4a33633bc1c21ccc0f78f
471	77	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	60c64b340011a1edd0b72c5849f08ea70902915d33cc65cf8981d28992c19a01
472	84	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	6b57f57b92721921b267cc984d56a9995c841dcbf83b498611eced6fc41700d2
473	88	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	60e1906cd8e00adc5891a6430ea3c7d1f77d272440fe6896f35e60c34f50ae17
474	79	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	45657b047139f4d937fd618c73dea937a6aa51c78ced3a5f1fb6620568319cc2
475	86	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	9525323670326ede5717004263020c608e10ecd4beca466d1bf2bf580556fe0e
476	78	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	03b4f2d3cc3d719b56330ff70167e077fd38752c076fa822a874024360097426
477	80	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA	0fc95f76582dc198a2f695a7ad05fdee478ce8999aa6b932af426222c57c9bff
478	89	2026-07-01	20	2026-07-01 00:00:00	Active	Automated GCTA (Restored by MSEC)	7bd5531d7b2d43177c33638e2504671cadc65659576dcdc815c830eb925eb5ad
453	82	2026-06-01	20	2026-04-06 14:38:54.250281	Active	Automated GCTA (REPAIRED: Ref [Page 45])	03d75dccb6efdb93dcca80f0ea8b65d34d6fb014d17cd79771a8aa308a3d9ed8
437	82	2026-05-01	20	2026-04-06 14:40:12.730457	Active	Automated GCTA (REPAIRED: Ref [dadsa])	5528279c6c9de37a1b679e57ab86c2d0ce27f4c1cf81db8db7ac2d415abb1edb
422	82	2026-04-01	20	2026-04-06 14:41:02.164009	Active	Automated GCTA (REPAIRED: Ref [sadas])	1e7d5bf60c16fb30ef3fccb2c1b8c32980400c24cb0cda45a3c9c6cf480f7ebf
421	82	2026-04-01	20	2026-04-06 14:44:20.292532	Active	Automated GCTA (REPAIRED: Ref [312312])	1e7d5bf60c16fb30ef3fccb2c1b8c32980400c24cb0cda45a3c9c6cf480f7ebf
\.


--
-- Data for Name: incident_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.incident_tbl (incident_id, pdl_id, incident_date, category, penalty_end_date, remarks, status) FROM stdin;
14	73	2026-04-03	Less Serious	2026-07-03	asdasd	Active
15	72	2026-04-03	Less Serious	2026-07-03	asd	Active
16	71	2026-04-03	Less Serious	2026-07-03	asda	Active
17	74	2026-04-05	Less Serious	2026-07-05	dasdsa	Active
18	76	2026-04-05	Less Serious	2026-07-05	asdsa	Active
19	75	2026-04-05	Less Serious	2026-07-05	asdas	Active
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
6	71	50000.00	0.00	675.00	243	\N	Active	\N	2026-03-30 20:14:41.565849	2026-03-30 20:39:12.291642
8	76	6000.00	0.00	675.00	243	\N	Active	\N	2026-04-05 12:06:38.890408	2026-04-05 12:07:00.869966
9	78	20000.00	0.00	678.00	243	\N	Active	\N	2026-04-05 17:09:35.743773	2026-04-05 17:09:35.743773
\.


--
-- Data for Name: pdl_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pdl_tbl (pdl_id, first_name, middle_name, last_name, gender, birthday, pdl_status, date_commited_pnp, date_admitted_bjmp, sentence_years, sentence_months, sentence_days, original_release_date, expected_releasedate, rfid_number, pdl_picture, is_locked_for_gcta, total_timeallowance_earned, case_number, crime_name, created_at, updated_at, is_legally_disqualified, disqualification_reason, date_of_final_judgment) FROM stdin;
82	Andrea	Tagana	Ducosin	Female	2000-10-10	Detained	\N	2025-10-10	0	0	0	\N	1969-09-21	1233332226	pdl-1775382881481-269078102.png	f	101	123132	Theft	2026-04-05 17:54:41.536162	2026-04-05 17:54:59.439058	f	\N	\N
89	Mark	Sinamban	Lising3		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-31	2028-02-05	3332221115	\N	f	55	123132	Theft	2026-04-05 20:07:46.142962	2026-04-06 17:01:09.433514	t	Disqualified under RA 10592	2026-04-01
69	Donny	Tino	Nakulangan		2005-10-10	Detained	\N	2026-01-11	0	0	0	\N	1969-11-21	1231231223	pdl-1774798834666-152652011.png	f	40	123	Theft	2026-03-29 23:40:34.811442	2026-04-05 13:25:16.117792	f	\N	\N
72	Piolo	Sinamban	Pascual		2000-01-11	Sentenced	2025-09-09	2025-10-10	3	0	0	2028-09-08	2028-06-18	1231231231	pdl-1775191671998-700690596.png	t	82	CA-10-007	Murder	2026-04-03 12:47:52.060649	2026-04-04 00:24:11.458635	f	\N	2026-04-04
70	Dingdong	Tino	Ravanera		2000-10-10	Released	\N	\N	0	0	0	\N	\N	\N	pdl-1774800042327-552045047.png	f	0	CA-10-003	Theft	2026-03-30 00:00:42.36496	2026-04-05 12:25:33.526549	f	\N	\N
83	Mark	Sinamban	Wanta	Male	2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-02-29	2027-05-30	1233332222	pdl-1775382947880-28074372.png	f	101	123	Theft	2026-04-05 17:55:48.025102	2026-04-05 17:58:34.571733	t	Disqualified under RA 10592	2026-03-01
71	Daniel	Garcia	James		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-05-13	2028-04-23	1259582543	pdl-1774800115570-746657000.png	t	20	CA-10-007	Murder	2026-03-30 00:01:55.605327	2026-04-04 19:28:43.521222	t	Disqualified under RA 10592	2026-03-01
76	Mark	asdsa	Lising		2000-10-10	Sentenced	2025-09-10	2025-10-10	2	0	0	2027-09-17	2027-08-06	1231231239	pdl-1775363255107-193255126.png	t	42	11132	Theft	2026-04-04 20:52:46.491333	2026-04-05 17:50:35.418317	f	\N	2026-05-04
88	Mark	Sinamban	Lising2		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-02	2027-11-21	3332221113	\N	f	102	123132	Theft	2026-04-05 19:45:24.089157	2026-04-06 13:50:03.17006	t	Disqualified under RA 10592	2026-03-03
77	Rian	Brina	Lising		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-04-04	2027-07-30	1112223331	pdl-1775379143655-819888746.jpeg	f	40	123132	Theft	2026-04-05 16:52:23.729023	2026-04-05 17:50:20.49599	t	Disqualified under RA 10592	2026-04-05
84	Lider	Moral	Wanta		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-02-29	2027-05-30	1233332227	pdl-1775383167688-451053284.png	f	101	123132	Theft	2026-04-05 17:59:27.726599	2026-04-05 18:13:01.48936	t	Disqualified under RA 10592	2026-03-01
74	Mark	Sinamban	Lising		2000-02-02	Sentenced	2025-09-09	2025-10-10	1	0	0	2027-02-01	2026-12-01	1231112221	pdl-1775283567607-130516828.png	t	62	123	Theft	2026-04-04 14:19:27.666933	2026-04-05 15:33:24.496666	t	Disqualified under RA 10592	2026-02-02
79	Mark	Sinamban	Brina	Male	2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-31	2027-07-10	1112223330	pdl-1775381451734-183520882.png	f	60	123132	Theft	2026-04-05 17:30:51.909259	2026-04-05 17:50:13.833202	t	Disqualified under RA 10592	2026-04-01
73	John	Caguioia	Martin		2005-10-10	Sentenced	2025-09-09	2025-10-10	3	0	0	2029-04-02	2029-04-02	1231231232	pdl-1775191797185-906608352.jpg	t	0	CA-10-005	Malversation	2026-04-03 12:49:57.245391	2026-04-05 13:26:48.878903	t	Disqualified under RA 10592	2026-04-03
81	Cyril	Santos	Tagana		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-02-29	2027-10-30	1233332221	pdl-1775382489003-642162659.jpg	f	122	123	Theft	2026-04-05 17:48:09.064878	2026-04-06 13:12:51.900707	t	Disqualified under RA 10592	2026-03-01
86	Wakanda	Santos	Foreva		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2027-09-08	2027-05-30	1113332222	pdl-1775384189974-968797930.png	f	101	123132	Robbery	2026-04-05 18:16:30.016901	2026-04-05 20:21:33.709135	f	\N	2026-03-03
78	Kathry	Brina	Encina	Male	2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-29	2027-06-19	1112223332	pdl-1775379897681-907359385.png	f	81	123	Theft	2026-04-05 16:59:12.172575	2026-04-05 20:25:23.166968	t	Disqualified under RA 10592	2026-03-01
80	Kathren	Brina	Aguigam	Female	2000-02-02	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-31	2027-07-10	1112223335	pdl-1775381742012-347140480.jpg	f	60	12312	Theft	2026-04-05 17:35:42.063995	2026-04-05 17:37:33.609853	t	Disqualified under RA 10592	2026-04-01
75	Bronny	Nakulangan	James		2000-10-10	Detained	\N	2025-10-10	0	0	0	\N	\N	1231231233	pdl-1775293077762-476497486.png	t	62	123132	Theft	2026-04-04 16:57:57.804425	2026-04-06 14:46:28.439408	f	\N	\N
87	Papa	Panget	Piolo		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-03-02	2027-05-30	1133223311	pdl-1775389023742-371880274.jpg	f	101	123	Drugs	2026-04-05 19:37:03.900455	2026-04-05 20:15:06.310971	t	Disqualified under RA 10592	2026-03-03
85	Rod	Brina	Aguigam		2000-10-10	Sentenced	2025-09-09	2025-10-10	2	0	0	2028-02-29	2027-05-30	1113332221	pdl-1775384045869-661779045.png	f	101	011	Theft	2026-04-05 18:14:05.912714	2026-04-05 18:14:53.095901	t	Disqualified under RA 10592	2026-03-01
\.


--
-- Data for Name: released_tbl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.released_tbl (release_id, pdl_id, first_name, last_name, middle_name, birthday, gender, crime_name, sentence_years, sentence_months, sentence_days, total_credits_applied, date_commited_pnp, actual_release_date, remarks, date_admitted_bjmp, is_legally_disqualified, date_of_final_judgment) FROM stdin;
31	69	Donny	Nakulangan	Tino	2005-10-10		Murder	2	0	0	20	2025-09-09	2026-04-04	Disqualified under RA 10592	2025-10-10	t	2026-03-25
32	70	Dingdong	Ravanera	Tino	2000-10-10		Theft	2	0	0	102	2025-09-09	2026-04-05	Disqualified under RA 10592	2025-10-10	t	2026-02-10
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
26	2	1	t	t	t	f	f
28	2	3	t	t	t	f	t
33	3	3	t	t	f	f	f
35	3	5	f	f	f	f	f
29	2	4	t	f	f	f	t
27	2	2	t	f	f	f	t
32	3	2	t	t	t	f	f
34	3	4	t	f	f	f	f
31	3	1	t	t	f	f	f
30	2	5	t	f	f	f	f
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
\.


--
-- Data for Name: tastm_days_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tastm_days_log (tastm_log_id, pdl_id, month_year, total_hours_accumulated, days_earned, date_granted, remarks, status, row_hash) FROM stdin;
586	87	2026-04-01	21.00	21	2026-04-05 19:37:11.324736	Migration - Locked	Inactive	\N
599	89	2026-04-01	64.00	15	2026-04-06 17:20:12.904327	Automated TASTM	Active	9205580e1cf0c3a8a0f991ff64c4148ab70c4380a62c21726e27d734853deb78
555	74	2026-05-01	24.00	0	2026-04-04 19:23:01.718536	Automated TASTM	Active	\N
538	74	2026-04-01	21.00	21	2026-04-04 14:29:28.234189	Migration - Locked	Inactive	\N
565	80	2026-04-01	21.00	21	2026-04-05 17:36:26.623793	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	Voided	\N
556	74	2026-06-01	32.00	0	2026-04-04 19:24:39.919688	Automated TASTM	Active	\N
517	71	2026-03-01	21.00	21	2026-03-30 00:02:05.683963	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-03-01)	Voided	\N
589	79	2026-04-01	0.00	0	2026-04-05 20:11:44.957068	Automated TASTM	Active	\N
566	81	2026-04-01	21.00	21	2026-04-05 17:52:25.327254	Migration - Locked	Inactive	\N
568	82	2026-04-01	21.00	21	2026-04-05 17:54:53.072223	Migration - Locked	Inactive	\N
570	83	2026-04-01	21.00	21	2026-04-05 17:57:36.087681	Migration - Locked	Inactive	\N
571	83	2026-04-01	21.00	0	2026-04-06 01:17:01.825862	Automated TASTM	Active	fb756e889a63bf2531306b9ab118749c909b4333e309601ff08b8431312f999e
560	77	2026-04-01	0.00	0	2026-04-06 01:17:01.825862	Automated TASTM	Active	7b923833d1b286ef9d6c4b298ea22437f1684069764aa914d7afb36d0b35895e
532	73	2026-04-01	21.00	21	2026-04-03 12:50:08.901228	Migration - Locked	Voided	\N
559	76	2026-04-01	26.00	0	2026-04-05 13:26:46.026369	Automated TASTM	Active	\N
576	85	2026-04-01	21.00	0	2026-04-05 19:45:34.608987	Automated TASTM	Active	\N
542	74	2026-04-01	8.00	0	2026-04-05 13:30:55.149305	Automated TASTM (Restored by MSEC)	Active	\N
557	75	2026-04-01	31.00	0	2026-04-05 15:30:20.521062	Automated TASTM	Active	\N
585	86	2026-04-01	21.00	0	2026-04-06 01:17:01.825862	Automated TASTM	Active	9d811fb6853bc727de976732bbfcae514ffcd87e1c09881ad207d6139bc81ebf
574	84	2026-04-01	21.00	0	2026-04-05 19:45:34.608987	Automated TASTM	Active	\N
531	72	2026-04-01	28.00	0	2026-04-04 00:24:10.870701	Automated TASTM	Active	\N
530	72	2026-04-01	21.00	21	2026-04-03 12:48:26.280494	Migration - Locked	Inactive	\N
543	75	2026-04-01	21.00	21	2026-04-04 16:58:06.134787	Migration - Locked	Inactive	\N
535	69	2026-04-01	0.00	0	2026-04-05 20:11:44.957068	Automated TASTM	Active	\N
590	80	2026-04-01	0.00	0	2026-04-05 20:11:44.957068	Automated TASTM	Active	\N
572	84	2026-04-01	21.00	21	2026-04-05 17:59:38.079648	Migration - Locked	Inactive	\N
561	77	2026-04-01	21.00	21	2026-04-05 16:54:26.605477	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-05)	Voided	\N
558	76	2026-04-01	21.00	21	2026-04-05 11:49:54.110336	Migration - Locked	Inactive	\N
513	69	2026-03-01	21.00	21	2026-03-29 23:40:53.956397	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-03-25)	Released	\N
528	69	2026-04-01	64.00	15	2026-04-04 00:53:53.698809	Automated TASTM (Restored by MSEC)	Released	\N
516	70	2026-04-01	21.00	21	2026-04-05 00:00:56.015403	Migration - Locked	Released	\N
529	70	2026-04-01	0.00	0	2026-04-05 11:50:17.321083	Automated TASTM	Released	\N
588	88	2026-04-01	21.00	21	2026-04-05 19:45:32.895858	Migration - Locked	Inactive	\N
575	85	2026-04-01	21.00	21	2026-04-05 18:14:17.099896	Migration - Locked	Inactive	\N
591	88	2026-04-01	21.00	0	2026-04-06 13:49:31.599823	Automated TASTM (Restored by MSEC)	Active	33140da112d3783728e4eeb01536e9a61badbf38fddd6385a28846b7bceb0d77
562	78	2026-04-01	21.00	21	2026-04-05 16:59:29.724481	Migration - Locked	Inactive	\N
563	78	2026-04-01	21.00	0	2026-04-06 01:17:01.825862	Automated TASTM	Active	234351e10a492fd15e9500eb2067f6fb0a319b5856a782ca4719f0693297824b
587	87	2026-04-01	21.00	0	2026-04-06 01:17:01.825862	Automated TASTM	Active	7204df90d7a246f9a55a76a449e8f6883e27447a84cf6b0f2092ff6c6c98e712
564	79	2026-04-01	21.00	21	2026-04-05 17:31:04.140627	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	Voided	\N
567	81	2026-04-01	24.00	0	2026-04-06 13:12:44.385993	Automated TASTM	Active	72b306df28cd275c14fc4581666d894153f8ab1c7e6a779eb4b435de242a6ceb
577	86	2026-04-01	21.00	21	2026-04-05 18:16:40.067755	Migration - Locked	Inactive	\N
569	82	2026-04-01	21.00	0	2026-04-05 19:33:13.724214	Automated TASTM	Active	\N
548	75	2026-05-01	64.00	15	2026-04-06 14:35:41.672329	Automated TASTM (REPAIRED: Ref [Page-45])	Active	36c387dd42df6b9a150c4713f16fe227c95b25f596d10e354bc262f265fc96eb
595	89	2026-04-01	21.00	21	2026-04-05 20:07:53.54471	Migration - VOIDED (System Locked): RA 10592 Exclusion (Judgment: 2026-04-01)	Voided	\N
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

SELECT pg_catalog.setval('public.attendance_tbl_attendance_id_seq', 238, true);


--
-- Name: audit_log_tbl_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_tbl_log_id_seq', 577, true);


--
-- Name: gcta_days_log_gcta_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gcta_days_log_gcta_log_id_seq', 478, true);


--
-- Name: incident_tbl_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.incident_tbl_incident_id_seq', 19, true);


--
-- Name: moduletbl_moduleid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.moduletbl_moduleid_seq', 5, true);


--
-- Name: pdl_subsidiary_tbl_subsidiary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pdl_subsidiary_tbl_subsidiary_id_seq', 9, true);


--
-- Name: pdl_tbl_pdl_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pdl_tbl_pdl_id_seq', 89, true);


--
-- Name: released_tbl_release_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.released_tbl_release_id_seq', 32, true);


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

SELECT pg_catalog.setval('public.session_tbl_session_id_seq', 163, true);


--
-- Name: tastm_days_log_tastm_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tastm_days_log_tastm_log_id_seq', 599, true);


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

\unrestrict orp1HSJiZZMlxeISPj2urKFthSlnfH7FJnQUNfgZgJuXC8wVgZIGYE9Ot9kcGFO

