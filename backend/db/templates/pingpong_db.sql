--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: match_result; Type: TABLE; Schema: public; Owner: pingpong
--

CREATE TABLE public.match_result (
    id bigint NOT NULL,
    player1_id bigint,
    player2_id bigint,
    player1_score integer,
    player2_score integer,
    start_date timestamp without time zone DEFAULT now(),
    end_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.match_result OWNER TO pingpong;

--
-- Name: match_result_id_seq; Type: SEQUENCE; Schema: public; Owner: pingpong
--

CREATE SEQUENCE public.match_result_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.match_result_id_seq OWNER TO pingpong;

--
-- Name: match_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pingpong
--

ALTER SEQUENCE public.match_result_id_seq OWNED BY public.match_result.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    alias character varying(128) NOT NULL,
    email character varying(128) NOT NULL,
    name character varying(128),
    passwd_hash character varying(128) NOT NULL,
    passwd_salt character varying(16) NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: match_result id; Type: DEFAULT; Schema: public; Owner: pingpong
--

ALTER TABLE ONLY public.match_result ALTER COLUMN id SET DEFAULT nextval('public.match_result_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: match_result match_result_pkey; Type: CONSTRAINT; Schema: public; Owner: pingpong
--

ALTER TABLE ONLY public.match_result
    ADD CONSTRAINT match_result_pkey PRIMARY KEY (id);


--
-- Name: users users_alias_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_alias_key UNIQUE (alias);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: match_result match_result_player1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pingpong
--

ALTER TABLE ONLY public.match_result
    ADD CONSTRAINT match_result_player1_id_fkey FOREIGN KEY (player1_id) REFERENCES public.users(id);


--
-- Name: match_result match_result_player2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pingpong
--

ALTER TABLE ONLY public.match_result
    ADD CONSTRAINT match_result_player2_id_fkey FOREIGN KEY (player2_id) REFERENCES public.users(id);


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO pingpong;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO pingpong;


--
-- PostgreSQL database dump complete
--

