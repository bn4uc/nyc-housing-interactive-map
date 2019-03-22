#Script for organizing data to D3 upload
library(tidyverse)
library(dplyr)
library(jsonlite)
library(sf)
library(statar)

hmda13_ny <- read_csv("hmda13_ny.csv")
hmda14_ny <- read_csv("hmda14_ny.csv")
hmda15_ny <- read_csv("hmda15_ny.csv")
hmda16_ny <- read_csv("hmda16_ny.csv")
hmda17_ny <- read_csv("hmda17_ny.csv")


hmda_ny_5yrs <- rbind(hmda13_ny, hmda14_ny, hmda15_ny, hmda16_ny, hmda17_ny) %>%
  mutate(census_tract_number = gsub("\\.", "", census_tract_number)) %>% filter(county_name %in% c("Bronx County", "Kings County", "Queens County", "New York County", "Richmond County"))

hmda_ny_5yrs <- hmda_ny_5yrs %>% 
  mutate(outcome = ifelse(action_taken_name %in% 
                            c("Application approved but not accepted",
                              "Loan originated", "Loan purchased by the institution"),"Approved", 
                          ifelse(action_taken_name %in%
                                   c("Application denied by financial institution",
                                     "Preapproval request denied by financial institution"),
                                 "Denied", "Other")))

hmda_ny_5yrs <- hmda_ny_5yrs %>% mutate(race_alternative = applicant_race_name_1)
hmda_ny_5yrs$race_alternative[which(hmda_ny_5yrs$race_alternative %in% 
                                      c("American Indian or Alaska Native", "Native Hawaiian or Other Pacific Islander"))] <- "Other"

hmda_ny_5yrs$race_alternative[which(hmda_ny_5yrs$race_alternative == "Black or African American")] <- "Black"

hmda_ny_5yrs$race_alternative[which(hmda_ny_5yrs$race_alternative %in% c("Information not provided by applicant in mail, Internet, or telephone application", "Not applicable"))] <- "Unknown"

hmda_ny_5yrs <- hmda_ny_5yrs %>% 
  mutate(win_loan_amount = winsorize(loan_amount_000s, probs = c(.01, .99)))

hmda_ny_5yrs <- hmda_ny_5yrs %>% 
  mutate(win_income = winsorize(applicant_income_000s, probs = c(.01, .99)))

hmda_ny_5yrs <- hmda_ny_5yrs %>% mutate(win_loan_income_ratio = win_loan_amount/win_income)

#regroup denial reasons 
hmda_ny_5yrs$denial_reason_alt <- hmda_ny_5yrs$denial_reason_name_1

hmda_ny_5yrs$denial_reason_alt[which(hmda_ny_5yrs$denial_reason_alt %in% 
                                       c("Employment history", "Insufficient cash (downpayment, closing costs)","Mortgage insurance denied","Unverifiable information"))] <- "Other"

census_tracts <- st_read("/Volumes/SPACESHIP/data_viz/data_scripts/visualizing-nyc-housing/2010_Census_Tracts", "geo_export_6e8e8432-67b3-4029-a002-fa59bbd3d5d3")

nta_shape <- st_read("/Volumes/SPACESHIP/data_viz/data_scripts/visualizing-nyc-housing/Neighborhood_Tabulation_Areas", "geo_export_f14927c2-d9cb-48d6-b521-916e745df67d")

rm(hmda13_ny, hmda14_ny, hmda15_ny, hmda16_ny, hmda17_ny)

crosswalk<- read_csv("crosswalk_nta_ct.csv")
crosswalk$X4 <- NULL

hmda_ny_5yrs <- hmda_ny_5yrs %>% left_join(crosswalk, by = c("census_tract_number" = "census_tract")) 

rm(crosswalk)

#grouping by NTA and creating stats
outcome_nta <- hmda_ny_5yrs %>% 
  group_by(ntacode, ntaname, outcome, as_of_year) %>% 
  summarise(apps_outcome = n())

overall_num_nta <- hmda_ny_5yrs %>% 
  group_by(ntacode, ntaname, as_of_year) %>% 
  summarise(totals = n())

hmda_by_nta <- hmda_ny_5yrs %>% 
  group_by(ntaname, ntacode, as_of_year) %>% 
  summarise(avg_inc = round(mean(win_income, na.rm = TRUE)*1000,0), 
            avg_loan_to_inc = round(mean(win_loan_income_ratio, na.rm = TRUE),2), 
            avg_loan_amount = round(mean(win_loan_amount, na.rm = TRUE)*1000,0))

outcome_nta <- outcome_nta %>% 
  left_join(overall_num_nta, by = c("ntaname", "ntacode", "as_of_year")) %>% 
  mutate(outcome_rate = round(apps_outcome/totals*100),2)

approval_rates <- outcome_nta %>% 
  filter(outcome == "Approved") %>% 
  rename(approval_rate = outcome_rate) %>% 
  select(ntaname, ntacode, as_of_year, approval_rate)

denial_rates <- outcome_nta %>% 
  filter(outcome == "Denied") %>% 
  rename(denial_rate = outcome_rate) %>% 
  select(ntaname, ntacode, as_of_year, denial_rate)

hmda_by_nta <- hmda_by_nta %>% 
  left_join(approval_rates, by = c("as_of_year", "ntaname", "ntacode")) %>% 
  left_join(denial_rates, by = c("as_of_year", "ntaname", "ntacode")) %>% 
  select(-c(outcome.x, outcome.y))

hmda_by_nta_general_2013 <- hmda_by_nta %>% filter(as_of_year == 2013,
                                                   !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")))
write_csv(hmda_by_nta_general_2013, "hmda_nta_general_2013.csv")
write_json(hmda_by_nta_general_2013, "hmda_nta_general_2013.json")

hmda_by_nta_general_2014<- hmda_by_nta %>% filter(as_of_year == 2014, 
                                                  !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")))
write_csv(hmda_by_nta_general_2014, "hmda_nta_general_2014.csv")
write_json(hmda_by_nta_general_2014, "hmda_nta_general_2014.json")

hmda_by_nta_general_2015<- hmda_by_nta %>% filter(as_of_year == 2015, 
                                                  !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_general_2015, "hmda_nta_general_2015.csv")
write_json(hmda_by_nta_general_2015, "hmda_nta_general_2015.json")

hmda_by_nta_general_2016<- hmda_by_nta %>% filter(as_of_year == 2016, 
                                                  !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")))
write_csv(hmda_by_nta_general_2016, "hmda_nta_general_2016.csv")
write_json(hmda_by_nta_general_2016, "hmda_nta_general_2016.json")

hmda_by_nta_general_2017<- hmda_by_nta %>% filter(as_of_year == 2017, 
                                                  !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")))
write_csv(hmda_by_nta_general_2017, "hmda_nta_general_2017.csv")
write_json(hmda_by_nta_general_2017, "hmda_nta_general_2017.json")

#working with race
hmda_by_nta_race <- hmda_ny_5yrs %>% 
  group_by(ntacode, ntaname, as_of_year, race_alternative) %>% 
  summarise(avg_inc = round(mean(win_income, na.rm = TRUE)*1000,0), 
            avg_loan_to_inc = round(mean(win_loan_income_ratio, na.rm = TRUE),2), 
            avg_loan_amount = round(mean(win_loan_amount, na.rm = TRUE)*1000,0))

outcome_nta_race <- hmda_ny_5yrs %>% 
  group_by(ntacode, ntaname, outcome, as_of_year, race_alternative) %>% 
  summarise(apps_outcome = n())

overall_num_nta_race <- hmda_ny_5yrs %>% 
  group_by(ntacode, ntaname, as_of_year, race_alternative) %>% 
  summarise(totals = n())

outcome_nta_race <- outcome_nta_race %>% 
  left_join(overall_num_nta_race, by = c("ntaname", "ntacode", "as_of_year", "race_alternative")) %>% 
  mutate(outcome_rate = round(apps_outcome/totals*100,2))

approval_rates_race <- outcome_nta_race %>% 
  filter(outcome == "Approved") %>% 
  rename(approval_rate = outcome_rate) %>% 
  select(ntaname, ntacode, as_of_year, approval_rate, race_alternative)

denial_rates_race <- outcome_nta_race %>% 
  filter(outcome == "Denied") %>% 
  rename(denial_rate = outcome_rate) %>% 
  select(ntaname, ntacode, as_of_year, denial_rate, race_alternative)

hmda_by_nta_race <- hmda_by_nta_race %>% 
  left_join(approval_rates_race, by = c("as_of_year", "ntaname", "ntacode", "race_alternative")) %>% 
  left_join(denial_rates_race, by = c("as_of_year", "ntaname", "ntacode", "race_alternative")) %>% 
  select(-c(outcome.x, outcome.y))

hmda_by_nta_white_2013 <- hmda_by_nta_race %>% filter(as_of_year == 2013, race_alternative == "White", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_white_2013, "hmda_nta_white_2013.csv")
write_json(hmda_by_nta_white_2013, "hmda_nta_white_2013.json")

hmda_by_nta_white_2014<- hmda_by_nta_race %>% filter(as_of_year == 2014, race_alternative == "White", 
                                                     !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_white_2014, "hmda_nta_white_2014.csv")
write_json(hmda_by_nta_white_2014, "hmda_nta_white_2014.json")

hmda_by_nta_white_2015 <- hmda_by_nta_race %>% filter(as_of_year == 2015, race_alternative == "White", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_white_2015, "hmda_nta_white_2015.csv")
write_json(hmda_by_nta_white_2015, "hmda_nta_white_2015.json")

hmda_by_nta_white_2016 <- hmda_by_nta_race %>% filter(as_of_year == 2016, race_alternative == "White", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_white_2016, "hmda_nta_white_2016.csv")
write_json(hmda_by_nta_white_2016, "hmda_nta_white_2016.json")

hmda_by_nta_white_2017 <- hmda_by_nta_race %>% filter(as_of_year == 2017, race_alternative == "White", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_white_2017, "hmda_nta_white_2017.csv")
write_json(hmda_by_nta_white_2017, "hmda_nta_white_2017.json")

hmda_by_nta_black_2013 <- hmda_by_nta_race %>% filter(as_of_year == 2013, race_alternative == "Black", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_black_2013, "hmda_nta_black_2013.csv")
write_json(hmda_by_nta_black_2013, "hmda_nta_black_2013.json")

hmda_by_nta_black_2014<- hmda_by_nta_race %>% filter(as_of_year == 2014, race_alternative == "Black", 
                                                     !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_black_2014, "hmda_nta_black_2014.csv")
write_json(hmda_by_nta_black_2014, "hmda_nta_black_2014.json")

hmda_by_nta_black_2015 <- hmda_by_nta_race %>% filter(as_of_year == 2015, race_alternative == "Black", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_black_2015, "hmda_nta_black_2015.csv")
write_json(hmda_by_nta_black_2015, "hmda_nta_black_2015.json")

hmda_by_nta_black_2016 <- hmda_by_nta_race %>% filter(as_of_year == 2016, race_alternative == "Black", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_black_2016, "hmda_nta_black_2016.csv")
write_json(hmda_by_nta_black_2016, "hmda_nta_black_2016.json")

hmda_by_nta_black_2017 <- hmda_by_nta_race %>% filter(as_of_year == 2017, race_alternative == "Black", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_black_2017, "hmda_nta_black_2017.csv")
write_json(hmda_by_nta_black_2017, "hmda_nta_black_2017.json")

hmda_by_nta_asian_2013 <- hmda_by_nta_race %>% filter(as_of_year == 2013, race_alternative == "Asian", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_asian_2013, "hmda_nta_asian_2013.csv")
write_json(hmda_by_nta_asian_2013, "hmda_nta_asian_2013.json")

hmda_by_nta_asian_2014<- hmda_by_nta_race %>% filter(as_of_year == 2014, race_alternative == "Asian", 
                                                     !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_asian_2014, "hmda_nta_asian_2014.csv")
write_json(hmda_by_nta_asian_2014, "hmda_nta_asian_2014.json")

hmda_by_nta_asian_2015 <- hmda_by_nta_race %>% filter(as_of_year == 2015, race_alternative == "Asian", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_asian_2015, "hmda_nta_asian_2015.csv")
write_json(hmda_by_nta_asian_2015, "hmda_nta_asian_2015.json")

hmda_by_nta_asian_2016 <- hmda_by_nta_race %>% filter(as_of_year == 2016, race_alternative == "Asian", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_asian_2016, "hmda_nta_asian_2016.csv")
write_json(hmda_by_nta_asian_2016, "hmda_nta_asian_2016.json")

hmda_by_nta_asian_2017 <- hmda_by_nta_race %>% filter(as_of_year == 2017, race_alternative == "Asian", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_asian_2017, "hmda_nta_asian_2017.csv")
write_json(hmda_by_nta_asian_2017, "hmda_nta_asian_2017.json")

hmda_by_nta_other_2013 <- hmda_by_nta_race %>% filter(as_of_year == 2013, race_alternative == "Other", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_other_2013, "hmda_nta_other_2013.csv")
write_json(hmda_by_nta_other_2013, "hmda_nta_other_2013.json")

hmda_by_nta_other_2014<- hmda_by_nta_race %>% filter(as_of_year == 2014, race_alternative == "Other", 
                                                     !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_other_2014, "hmda_nta_other_2014.csv")
write_json(hmda_by_nta_other_2014, "hmda_nta_other_2014.json")

hmda_by_nta_other_2015 <- hmda_by_nta_race %>% filter(as_of_year == 2015, race_alternative == "Other", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_other_2015, "hmda_nta_other_2015.csv")
write_json(hmda_by_nta_other_2015, "hmda_nta_other_2015.json")

hmda_by_nta_other_2016 <- hmda_by_nta_race %>% filter(as_of_year == 2016, race_alternative == "Other", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_other_2016, "hmda_nta_other_2016.csv")
write_json(hmda_by_nta_other_2016, "hmda_nta_other_2016.json")

hmda_by_nta_other_2017 <- hmda_by_nta_race %>% filter(as_of_year == 2017, race_alternative == "Other", 
                                                      !(ntacode %in% c("BX99", "BK99", "MN99", "SI99", "QN99")) )
write_csv(hmda_by_nta_other_2017, "hmda_nta_other_2017.csv")
write_json(hmda_by_nta_other_2017, "hmda_nta_other_2017.json")
