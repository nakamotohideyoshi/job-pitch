//
//  MessageThread.m
//  My Job Pitch
//
//  Created by user on 01/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MessageThread.h"
#import "MessageThreadCell.h"
#import "Message.h"
#import "JobDetails.h"
#import "JobSeekerDetails.h"

@interface MessageThread ()
@property (nonnull) NSMutableArray *messageData;
@end

@implementation MessageThread

- (void)viewDidLoad {
    [super viewDidLoad];
    //[SVProgressHUD dismiss];
    self.messageData = [NSMutableArray arrayWithArray:self.application.messages];
    self.application.messages = self.messageData;
    self.messages.rowHeight = UITableViewAutomaticDimension;
    self.messages.estimatedRowHeight = 96;
    self.messages.delegate = self;
    self.messages.dataSource = self;
    
    activeField = self.messageInput;
}

- (void)viewWillAppear:(BOOL)animated
{
    self.messages.alpha = 0;
    ApplicationStatus *statusCreated = [self.appDelegate getApplicationStatusByName:APPLICATION_CREATED];
    if ([self.appDelegate.user isJobSeeker]) {
        self.from.text = self.application.job.locationData.businessData.name;
        Image *image = [self.application.job getImage];
        if (image) {
            [self loadImageURL:image.thumbnail
                          into:self.image
                 withIndicator:self.imageActivity];
        } else {
            self.image.image = nil;
            self.imageActivity.hidden = true;
        }
        if ([self.application.status isEqual:statusCreated.id]) {
            self.messageInput.text = @"You cannot send messages until your application is accepted";
            self.messageInput.editable = false;
            self.sendButton.enabled = false;
            self.sendButton.alpha = 0.5;
        }
    } else {
        self.from.text = [NSString stringWithFormat:@"%@ %@",
                          self.application.jobSeeker.firstName,
                          self.application.jobSeeker.lastName];
        Pitch *pitch = [self.application.jobSeeker getPitch];
        if (pitch) {
            [self loadImageURL:pitch.thumbnail
                          into:self.image
                 withIndicator:self.imageActivity];
        } else {
            self.image.image = nil;
        }
        
        if ([self.application.status isEqual:statusCreated.id]) {
            self.messageInput.text = @"You cannot send messages until you have connected";
            self.messageInput.editable = false;
            self.sendButton.enabled = false;
            self.sendButton.alpha = 0.5;
        }
    }
    
    self.job.text = [NSString stringWithFormat:@"%@ (%@, %@)",
                     self.application.job.title,
                     self.application.job.locationData.name,
                     self.application.job.locationData.businessData.name];
}

-(void)viewDidAppear:(BOOL)animated
{
    [self scrollToBottomAnimated:false];
    self.messages.alpha = 1;
    [UIView animateWithDuration:1.0
                     animations:^{
                         self.tableBottomContraint.constant = 32;
                     } completion:^(BOOL finished) {
                         [self.appDelegate.api
                          loadApplicationWithId:self.application.id
                          success:^(Application *application) {
                              [UIView animateWithDuration:1.0
                                               animations:^{
                                                   self.tableBottomContraint.constant = 0;
                                               } completion:^(BOOL finished) {
                                                   [self newData:application.messages];
                                               }];
                          } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                              [MyAlertController showError:@"Error checking data" callback:nil];
                              [UIView animateWithDuration:1.0
                                               animations:^{
                                                   self.tableBottomContraint.constant = 0;
                                               }];
                          }];
                     }
     ];
}

-(void)newData:(NSArray *)messages
{
    NSMutableArray *newIndexes = [[NSMutableArray alloc]init];
    for (NSUInteger i = self.messageData.count; i < messages.count; i++) {
        [self.messageData addObject:[messages objectAtIndex:i]];
        [newIndexes addObject:[NSIndexPath indexPathForRow:i inSection:0]];
    }
    [self.messages insertRowsAtIndexPaths:newIndexes withRowAnimation:UITableViewRowAnimationNone];
    [self scrollToBottomAnimated:false];
}

-(void)scrollToBottomAnimated:(Boolean)animated
{
    [self.messages scrollToRowAtIndexPath:[NSIndexPath
                                           indexPathForRow:self.application.messages.count-1
                                           inSection:0]
                         atScrollPosition:UITableViewScrollPositionBottom
                                 animated:animated];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.application.messages.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    MessageThreadCell *cell = [self.messages dequeueReusableCellWithIdentifier:@"MessageThreadCell"];
    Message *message = [self.application.messages objectAtIndex:indexPath.row];
    Role *userRole = [self.appDelegate getUserRole];
    Role *fromRole = [self.appDelegate getRole:message.fromRole];
    if ([fromRole isEqual:userRole]) {
        cell.rightContraint.priority = UILayoutPriorityDefaultHigh;
    } else {
        cell.rightContraint.priority = UILayoutPriorityDefaultLow;
    }
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *today = [calendar startOfDayForDate:[NSDate date]];
    NSDate *createdDate = [calendar startOfDayForDate:message.created];
    NSDateFormatter *timeFormat = [[NSDateFormatter alloc] init];
    [timeFormat setDateFormat:@"HH:mma"];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"dd/MM/yyyy"];
    NSString *created;
    if ([createdDate isEqual:today])
        created = [NSString stringWithFormat:@"Today, %@",
                   [timeFormat stringFromDate:message.created]];
    else
        created = [NSString stringWithFormat:@"%@, %@",
                   [dateFormat stringFromDate:message.created],
                   [timeFormat stringFromDate:message.created]];
    if ([fromRole isEqual:userRole]) {
        cell.byLine.text = [NSString stringWithFormat:@"You, %@", created];
    } else {
        if ([fromRole isEqual:[self.appDelegate getRoleByName:ROLE_RECRUITER]]) {
            cell.byLine.text = [NSString stringWithFormat:@"%@, %@",
                                self.application.job.locationData.businessData.name,
                                created];
        } else {
            cell.byLine.text = [NSString stringWithFormat:@"%@ %@, %@",
                                self.application.jobSeeker.firstName,
                                self.application.jobSeeker.lastName,
                                created];
        }
    }
    cell.message.text = message.content;
    cell.backgroundColor = [UIColor clearColor];
    return cell;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_job_details"]) {
        JobDetails *jobDetailsView = [segue destinationViewController];
        [jobDetailsView setJob:self.application.job];
        [jobDetailsView setApplication:self.application];
    } else if ([[segue identifier] isEqualToString:@"goto_job_seeker_details"]) {
        JobSeekerDetails *jobSeekerDetailsView = [segue destinationViewController];
        [jobSeekerDetailsView setJobSeeker:self.application.jobSeeker];
        [jobSeekerDetailsView setApplication:self.application];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (IBAction)headerTap:(id)sender {
    if ([self.appDelegate.user isJobSeeker]) {
        [self performSegueWithIdentifier:@"goto_job_details" sender:nil];
    } else {
        [self performSegueWithIdentifier:@"goto_job_seeker_details" sender:nil];
    }
}

- (IBAction)send:(id)sender {
    if (![self.messageInput.text isEqualToString:@""]) {
        MessageForCreation *message = [[MessageForCreation alloc] init];
        message.content = self.messageInput.text;
        message.application = self.application.id;
        self.sendButton.enabled = false;
        self.sendButton.alpha = 0.5;
        self.messageInput.editable = false;
        [self.appDelegate.api
         sendMessage:message
         success:^(MessageForCreation *message) {
             [self.appDelegate.api
              loadApplicationWithId:self.application.id
              success:^(Application *application) {
                  [self newData:application.messages];
                  self.sendButton.enabled = true;
                  self.sendButton.alpha = 1.0;
                  self.messageInput.editable = true;
                  self.messageInput.text = @"";
              } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                  [MyAlertController showError:@"Error checking data" callback:nil];
              }];
         } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
             self.sendButton.enabled = true;
             self.sendButton.alpha = 1.0;
             self.messageInput.editable = true;
             [MyAlertController showError:@"Error sending data" callback:nil];
         }];
    }
}

@end
